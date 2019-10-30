(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('summaryCaseTab', SummaryCaseTab);

  /**
   * @param $location
   * @param crmApi
   */
  function SummaryCaseTab ($location, crmApi) {
    /**
     * Returns placeholder HTMl template url.
     */
    this.getPlaceholderUrl = function () {
      return '~/civicase/case/details/directives/placeholder/summary.html';
    };

    /**
     * Returns tab content HTMl template url.
     */
    this.activeTabContentUrl = function () {
      return '~/civicase/case/details/directives/tab-content/summary.html';
    };
  }
})(angular, CRM.$, CRM._);
