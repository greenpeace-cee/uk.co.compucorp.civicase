(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('summaryCaseTab', SummaryCaseTab);
  module.service('activityCaseTab', ActivityCaseTab);
  module.service('peopleCaseTab', PeopleCaseTab);
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
