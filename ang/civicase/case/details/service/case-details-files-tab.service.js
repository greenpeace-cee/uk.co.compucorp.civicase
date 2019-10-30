(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('filesCaseTab', FilesCaseTab);

  /**
   * @param $location
   * @param crmApi
   */
  function FilesCaseTab ($location, crmApi) {
    /**
     * Returns placeholder HTMl template url.
     */
    this.getPlaceholderUrl = function () {
      return '~/civicase/case/details/directives/placeholder/files.html';
    };

    /**
     * Returns tab content HTMl template url.
     */
    this.activeTabContentUrl = function () {
      return '~/civicase/case/details/directives/tab-content/files.html';
    };
  }
})(angular, CRM.$, CRM._);
