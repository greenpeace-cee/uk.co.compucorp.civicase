'use strict';

const Utility = require('./../utility.js');

module.exports = async (page, scenario, vp) => {
  const utility = new Utility(page, scenario, vp);

  await require('./overview-loading.js')(page, scenario, vp);
  await utility.waitForLoadingComplete();
};
