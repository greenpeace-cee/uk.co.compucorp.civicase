(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('peopleCaseTab', PeopleCaseTab);

  /**
   * @param $location
   * @param crmApi
   */
  function PeopleCaseTab ($location, crmApi) {
    /**
     * Returns placeholder HTMl template url.
     */
    this.getPlaceholderUrl = function () {
      return '~/civicase/case/details/directives/placeholder/people.html';
    };

    /**
     * Returns tab content HTMl template url.
     */
    this.activeTabContentUrl = function () {
      return '~/civicase/case/details/directives/tab-content/people.html';
    };
  }
})(angular, CRM.$, CRM._);
