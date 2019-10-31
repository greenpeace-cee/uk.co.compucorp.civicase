(function (angular, $, _, CRM) {
  var module = angular.module('civicase-base');

  module.service('CaseType', CaseType);

  /**
   * CaseType Service
   *
   * @param CaseTypeButtons
   */
  function CaseType (CaseTypeButtons) {
    var caseTypes = CRM['civicase-base'].caseTypes;

    this.getAll = getAll;
    this.getButtonsForCaseType = getButtonsForCaseType;
    this.getTitlesForNames = getTitlesForNames;

    /**
     * @returns {object[]} a list of case types.
     */
    function getAll () {
      return caseTypes;
    }

    /**
     * Returns the buttons for the given case type.
     *
     * @param {string} caseTypeName the name of the case type to get the buttons for.
     * @returns {object[]} a list of buttons.
     */
    function getButtonsForCaseType (caseTypeName) {
      return CaseTypeButtons[caseTypeName] || [];
    };

    /**
     * Returns a list of case type titles for the given names.
     *
     * @param {string[]} caseTypeNames the case type names.
     * @returns {string[]} a list of case type titles.
     */
    function getTitlesForNames (caseTypeNames) {
      return _.map(caseTypeNames, function (caseTypeName) {
        return _.findWhere(caseTypes, { name: caseTypeName }).title;
      });
    }
  }
})(angular, CRM.$, CRM._, CRM);
