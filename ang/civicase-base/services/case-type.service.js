(function (angular, $, _, CRM) {
  var module = angular.module('civicase-base');

  module.service('CaseType', CaseType);

  /**
   * CaseType Service
   */
  function CaseType () {
    var caseTypes = CRM['civicase-base'].caseTypes;

    this.getAll = getAll;
    this.getTitlesForNames = getTitlesForNames;

    /**
     * @returns {object[]} a list of case types.
     */
    function getAll () {
      return caseTypes;
    }

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
