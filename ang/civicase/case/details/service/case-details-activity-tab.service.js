(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('activityCaseTab', ActivityCaseTab);

  /**
   * @param $location
   * @param crmApi
   */
  function ActivityCaseTab ($location, crmApi) {
    /**
     * Returns placeholder HTMl template url.
     */
    this.getPlaceholderUrl = function () {
      return '~/civicase/case/details/directives/placeholder/activity.html';
    };

    /**
     * Returns tab content HTMl template url.
     */
    this.activeTabContentUrl = function () {
      return '~/civicase/case/details/directives/tab-content/activity.html';
    };
  }
})(angular, CRM.$, CRM._);
