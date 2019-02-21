/**
 * @file
 * Contains functional configurations for setting up backstopJS test suite
 */

'use strict';

var _ = require('lodash');
var argv = require('yargs').argv;
var backstopjs = require('backstopjs');
var clean = require('gulp-clean');
var colors = require('ansi-colors');
var execSync = require('child_process').execSync;
var file = require('gulp-file');
var fs = require('fs');
var gulp = require('gulp');
var notify = require('gulp-notify');
var path = require('path');
var PluginError = require('plugin-error');
var puppeteer = require('puppeteer');

var BACKSTOP_DIR = 'tests/backstop_data/';
var CACHE = {
  caseId: null,
  emptyCaseId: null
};
var CONFIG_TPL = {
  'url': 'http://%{site-host}',
  'drush_alias': '',
  'root': '%{path-to-site-root}'
};
var FILES = {
  siteConfig: path.join(BACKSTOP_DIR, 'site-config.json'),
  temp: path.join(BACKSTOP_DIR, 'backstop.temp.json'),
  tpl: path.join(BACKSTOP_DIR, 'backstop.tpl.json')
};
var RECORD_IDENTIFIERS = {
  emptyCaseSubject: 'Backstop Empty Case',
  emptyCaseTypeName: 'backstop_empty_case_type',
  emptyContactDisplayName: 'Emil Backstop'
};
var URL_VAR_REPLACERS = [
  replaceCaseIdVar,
  replaceEmptyCaseIdVar,
  replaceRootUrlVar
];

var createUniqueCase = createUniqueRecordFactory('Case', 'subject');
var createUniqueCaseType = createUniqueRecordFactory('CaseType', 'name');
var createUniqueContact = createUniqueRecordFactory('Contact', 'display_name');

/**
 * Returns the list of the scenarios from
 *   a. All the different groups if `group` is == '_all_',
 *   b. Only the given group
 *
 * @param {String} group
 * @return {Array}
 */
function buildScenariosList (group) {
  const dirPath = path.join(BACKSTOP_DIR, 'scenarios');

  return _(fs.readdirSync(dirPath))
    .filter(scenario => {
      return (group === '_all_' ? true : scenario === `${group}.json`) && scenario.endsWith('.json');
    })
    .map(scenario => {
      return JSON.parse(fs.readFileSync(path.join(dirPath, scenario))).scenarios;
    })
    .flatten()
    .map((scenario, index, scenarios) => {
      const url = replaceUrlVars(scenario.url);

      return _.assign({}, scenario, {
        cookiePath: path.join(BACKSTOP_DIR, 'cookies', 'admin.json'),
        count: '(' + (index + 1) + ' of ' + scenarios.length + ')',
        url: url
      });
    })
    .value();
}

/**
 * Throws an error if it finds any inside one of the `cv api` responses.
 *
 * @param {Array} responses the list of responses as returned by `cv api:batch`.
 */
function checkAndThrowApiResponseErrors (responses) {
  responses.forEach((response) => {
    if (response.is_error) {
      throw response.error_message;
    }
  });
}

/**
 * Removes the temp config file and sends a notification
 * based on the given outcome from BackstopJS
 *
 * @param {Boolean} success
 */
function cleanUpAndNotify (success) {
  gulp
    .src(FILES.temp, { read: false })
    .pipe(clean())
    .pipe(notify({
      message: success ? 'Success' : 'Error',
      title: 'BackstopJS',
      sound: 'Beep'
    }));
}

/**
 * Creates the content of the config temporary file that will be fed to BackstopJS
 * The content is the mix of the config template and the list of scenarios
 * under the scenarios/ folder
 *
 * @return {String}
 */
function createTempConfig () {
  var group = argv.group ? argv.group : '_all_';
  var list = buildScenariosList(group);
  var content = JSON.parse(fs.readFileSync(FILES.tpl));

  content.scenarios = list;

  ['bitmaps_reference', 'bitmaps_test', 'html_report', 'ci_report', 'engine_scripts'].forEach(path => {
    content.paths[path] = BACKSTOP_DIR + content.paths[path];
  });

  return JSON.stringify(content);
}

/**
 * Returns a function that creates unique records for the given entity.
 *
 * @param {String} entityName the name of the entity that the records belongs to.
 * @param {String} matchingField the field that will be used to check if the record
 *   has already been created. Ex.: `name`, `subject`, `title`, etc.
 * @return {Function}
 */
function createUniqueRecordFactory (entityName, matchingField) {
  /**
   * Checks if the record exists on the given entity before creating a new one.
   *
   * @param {Object} recordData the data used to create a new record on the Entity.
   * @return {Object} the returned value from the API.
   */
  return function createUniqueRecord (recordData) {
    var filter = { options: { limit: 1 } };
    filter[matchingField] = recordData[matchingField];

    var record = cvApi(entityName, 'get', filter);

    if (record.count) {
      return record;
    }

    return cvApi(entityName, 'create', recordData);
  };
}

/**
 * Executes a single call to the `cv api` service and returns the response
 * in JSON format.
 *
 * @param {String} entityName the name of the entity to run the query on.
 * @param {String} action the entity action.
 * @param {Object} queryData the data to pass to the entity action.
 * @return {Object} the result from the entity action call.
 */
function cvApi (entityName, action, queryData) {
  var queryResponse = cvApiBatch([[entityName, action, queryData]]);

  return queryResponse[0];
}

/**
 * Executes multi calls to the `cv api` service and returns the response from
 * those calls in JSON format.
 *
 * @param {Array} queriesData a list of queries to pass to the `cv api:batch` service.
 */
function cvApiBatch (queriesData) {
  var config = siteConfig();
  var cmd = `echo '${JSON.stringify(queriesData)}' | cv api:batch`;
  var responses = JSON.parse(execSync(cmd, { cwd: config.root }));

  checkAndThrowApiResponseErrors(responses);

  return responses;
}

/**
 * Defines a BackstopJS gulp task for the given action.
 *
 * @param {String} action the name of the Backstop action.
 * @return {Object} gulp task.
 */
function defineBackstopJsAction (action) {
  return gulp.task('backstopjs:' + action, () => runBackstopJS(action));
}

/**
 * Tries to get the record id from the cache first and if not found will retrieve
 * it using `cv api`, store the record id, and return it.
 *
 * @param {String} cacheKey the cache key where the record id is stored.
 * @param {String} entityName the name of the enity the record belongs to.
 * @param {Object} queryData the query information used to retrieved the record.
 * @return {Number}
 */
function getRecordIdFromCacheOrCvApi (cacheKey, entityName, queryData) {
  if (!CACHE[cacheKey]) {
    CACHE[cacheKey] = cvApi(entityName, 'get', queryData).id;
  }

  return CACHE[cacheKey];
}

/**
 * Replaces the `{caseId}` var with the id of the first non deleted, open case.
 *
 * @param {String} url the scenario url.
 * @param {Object} config the site config options.
 * @return {String}
 */
function replaceCaseIdVar (url, config) {
  return url.replace('{caseId}', function () {
    var caseId = CACHE.caseId;

    if (!caseId) {
      var cmd = `cv api Case.getsingle is_deleted=0 status_id=Open option.limit=1`;
      var caseData = JSON.parse(execSync(cmd, { cwd: config.root }));
      caseId = caseData.id;
      CACHE.caseId = caseId;
    }

    return caseId;
  });
}

/**
 * Replaces the `{emptyCaseId}` var with the id for the empty case created by the setup script.
 *
 * @param {string} url the scenario url.
 * @return {String}
 */
function replaceEmptyCaseIdVar (url) {
  return url.replace('{emptyCaseId}', function () {
    return getRecordIdFromCacheOrCvApi('emptyCaseId', 'Case', {
      subject: RECORD_IDENTIFIERS.emptyCaseSubject
    });
  });
}

/**
 * Replaces the `{url}` var with the site url as defined in the config file.
 *
 * @param {string} url the scenario url.
 * @param {object} config the site config options.
 * @return {string}
 */
function replaceRootUrlVar (url, config) {
  return url.replace('{url}', config.url);
}

/**
 * Runs a series of URL var replaces for the scenario URL. A URL var would look
 * like `{url}/contact` and can be replaced into a string similar to
 * `http://example.com/contact`.
 *
 * @param {string} url the original scenario url with all vars intact.
 * @return {string} the scenario url with vars replaced.
 */
function replaceUrlVars (url) {
  const config = siteConfig();

  URL_VAR_REPLACERS.forEach(function (urlVarReplacer) {
    url = urlVarReplacer(url, config);
  });

  return url;
}

/**
 * Runs backstopJS with the given command.
 *
 * It fills the template file with the list of scenarios, creates a temp
 * file passed to backstopJS, then removes the temp file once the command is completed
 *
 * @param  {String} command
 * @return {Promise}
 */
function runBackstopJS (command) {
  if (touchSiteConfigFile()) {
    throwError(
      'No site-config.json file detected!\n' +
      `\tOne has been created for you under ${path.basename(BACKSTOP_DIR)}\n` +
      '\tPlease insert the real value for each placeholder and try again'
    );
  }

  return new Promise((resolve, reject) => {
    let success = false;

    gulp.src(FILES.tpl)
      .pipe(file(path.basename(FILES.temp), createTempConfig()))
      .pipe(gulp.dest(BACKSTOP_DIR))
      .on('end', async () => {
        try {
          (typeof argv.skipCookies === 'undefined') && await writeCookies();
          await backstopjs(command, { configPath: FILES.temp, filter: argv.filter });

          success = true;
        } finally {
          cleanUpAndNotify(success);

          success ? resolve() : reject(new Error('BackstopJS error'));
        }
      });
  })
    .catch(function (err) {
      throwError(err.message);
    });
}

/**
 * Setups the data needed for some of the backstop tests.
 */
function setupData () {
  var caseType = createUniqueCaseType({
    name: RECORD_IDENTIFIERS.emptyCaseTypeName,
    title: 'Backstop Empty Case Type',
    definition: {
      activityTypes: [],
      activitySets: [],
      caseRoles: [],
      timelineActivityTypes: []
    }
  });
  var contact = createUniqueContact({
    contact_type: 'Individual',
    display_name: RECORD_IDENTIFIERS.emptyContactDisplayName
  });

  createUniqueCase({
    case_type_id: caseType.id,
    contact_id: contact.id,
    subject: RECORD_IDENTIFIERS.emptyCaseSubject
  });
}

/**
 * Returns the content of site config file
 *
 * @return {Object}
 */
function siteConfig () {
  return JSON.parse(fs.readFileSync(FILES.siteConfig));
}

/**
 * Creates the site config file is in the backstopjs folder, if it doesn't exists yet
 *
 * @return {Boolean} Whether the file had to be created or not
 */
function touchSiteConfigFile () {
  let created = false;

  try {
    fs.readFileSync(FILES.siteConfig);
  } catch (err) {
    fs.writeFileSync(FILES.siteConfig, JSON.stringify(CONFIG_TPL, null, 2));

    created = true;
  }

  return created;
}

/**
 * A simple wrapper for displaying errors
 * It converts the tab character to the amount of spaces required to correctly
 * align a multi-line block of text horizontally
 *
 * @param {String} msg
 * @throws {Error}
 */
function throwError (msg) {
  throw new PluginError('Error', {
    message: colors.red(msg.replace(/\t/g, '    '))
  });
}

/**
 * Writes the session cookie files that will be used to log in as different users
 *
 * It uses the [`drush uli`](https://drushcommands.com/drush-7x/user/user-login/)
 * command to generate a one-time login url, the browser then go to that url
 * which then creates the session cookie
 *
 * The cookie is then stored in a json file which is used by the BackstopJS scenarios
 * to log in
 *
 * @return {Promise}
 */
async function writeCookies () {
  var cookiesDir = path.join(BACKSTOP_DIR, 'cookies');
  var cookieFilePath = path.join(cookiesDir, 'admin.json');
  var config = siteConfig();
  var command = `drush ${config.drush_alias} uli --name=admin --uri=${config.url} --browser=0`;
  var loginUrl = execSync(command, { encoding: 'utf8', cwd: config.root });
  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  await page.goto(loginUrl);

  var cookies = await page.cookies();
  await browser.close();

  !fs.existsSync(cookiesDir) && fs.mkdirSync(cookiesDir);
  fs.existsSync(cookieFilePath) && fs.unlinkSync(cookieFilePath);

  fs.writeFileSync(cookieFilePath, JSON.stringify(cookies));
}

/**
 * Exports backstopJS related tasks task
 *
 * @param {String} action
 */
module.exports = {
  setupData: setupData,
  defineAction: defineBackstopJsAction
};
