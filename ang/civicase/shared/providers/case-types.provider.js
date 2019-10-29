(function (angular, $, _) {
  var module = angular.module('civicase');

  module.provider('CaseTypes', function () {
    var caseTypes = getCaseTypesWithEmptyButtonsArray();

    this.addButtons = addButtons;
    this.$get = $get;

    /**
     * Provides the case types.
     *
     * @returns {object[]} the list of case types.
     */
    function $get () {
      return caseTypes;
    }

    /**
     * Adds the given buttons to their corresponding case types. These buttons will be shown
     * in the list of case types on the dashboard.
     *
     * @typedef {{
     *  url: string
     * }} ButtonConfig
     * @typedef {{
     *  caseTypeName: string,
     *  buttons: ButtonConfig[]
     * }} CaseTypeButtonsConfig
     * @param {CaseTypeButtonsConfig[]} buttonsConfig a list of case type buttons following this format:
     * ```
     * [
     *   {
     *     caseTypeName: 'housing_support',
     *     buttons: [
     *       { url: 'http://example.com' }
     *     ]
     *   }
     * ]
     * ```
     */
    function addButtons (buttonsConfig) {
      var buttonsConfigIndexedByCaseTypeName = _.indexBy(buttonsConfig, 'caseTypeName');

      _.forEach(caseTypes, function (caseType) {
        const caseTypeButtonsConfig = buttonsConfigIndexedByCaseTypeName[caseType.name];

        if (!caseTypeButtonsConfig) {
          return;
        }

        caseType.buttons = caseType.buttons.concat(caseTypeButtonsConfig.buttons);
      });
    }

    /**
     * Returns the list of case types stored in `CRM.civicase`, but also adds
     * an empty `buttons` array to each one of them.
     *
     * @returns {object[]} A list of case types.
     */
    function getCaseTypesWithEmptyButtonsArray () {
      return _.map(CRM.civicase.caseTypes, function (caseType) {
        return _.assign({}, caseType, {
          buttons: []
        });
      });
    }
  });
})(angular, CRM.$, CRM._);
