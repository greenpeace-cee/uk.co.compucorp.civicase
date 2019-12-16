(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('activitiesCaseTab', ActivitiesCaseTab);

  /**
   * Activities Case Tab service.
   *
   * @param {object} $location the location service.
   * @param {Function} crmApi the CRM API service.
   */
  function ActivitiesCaseTab ($location, crmApi) {
    /**
     * @returns {string} Returns placeholder HTMl template url.
     */
    this.getPlaceholderUrl = function () {
      return '~/civicase/case/details/directives/placeholder/activity.html';
    };

    /**
     * @returns {string} Returns tab content HTMl template url.
     */
    this.activeTabContentUrl = function () {
      return '~/civicase/case/details/directives/tab-content/activity.html';
    };
  }
})(angular, CRM.$, CRM._);
