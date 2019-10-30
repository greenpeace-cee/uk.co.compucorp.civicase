(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('activitiesCaseTab', ActivitiesCaseTab);

  /**
   * @param $location
   * @param crmApi
   */
  function ActivitiesCaseTab ($location, crmApi) {
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
