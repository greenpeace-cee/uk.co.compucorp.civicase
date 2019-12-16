(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('summaryCaseTab', SummaryCaseTab);

  /**
   * Summary Case Tab service.
   *
   * @param {object} $location the location service.
   * @param {Function} crmApi the CRM API service.
   */
  function SummaryCaseTab ($location, crmApi) {
    /**
     * @returns {string} Returns placeholder HTMl template url.
     */
    this.getPlaceholderUrl = function () {
      return '~/civicase/case/details/directives/placeholder/summary.html';
    };

    /**
     * @returns {string} Returns tab content HTMl template url.
     */
    this.activeTabContentUrl = function () {
      return '~/civicase/case/details/directives/tab-content/summary.html';
    };
  }
})(angular, CRM.$, CRM._);
