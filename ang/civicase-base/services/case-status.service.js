(function (angular, $, _, CRM) {
  var module = angular.module('civicase-base');

  module.service('CaseStatus', CaseStatus);

  /**
   * Case Status Service
   */
  function CaseStatus () {
    var caseStatuses = CRM['civicase-base'].caseStatuses;

    this.getAll = getAll;
    this.getLabelsForValues = getLabelsForValues;

    /**
     * @returns {object[]} a list of all the case statuses.
     */
    function getAll () {
      return caseStatuses;
    }

    /**
     * Returns the labels for the given case status values.
     *
     * @param {string[]} statusValues a list of case status values.
     * @returns {string[]} a list of case status labels.
     */
    function getLabelsForValues (statusValues) {
      return _.map(statusValues, function (statusValue) {
        var caseStatus = _.find(caseStatuses, function (caseStatus) {
          return caseStatus.value === statusValue;
        });

        return caseStatus.label;
      });
    }
  }
})(angular, CRM.$, CRM._, CRM);
