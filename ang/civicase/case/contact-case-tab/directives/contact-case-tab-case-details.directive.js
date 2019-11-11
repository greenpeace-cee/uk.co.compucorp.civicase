(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTabCaseDetails', function () {
    return {
      controller: 'CivicaseContactCaseTabCaseDetailsController',
      restrict: 'EA',
      replace: true,
      templateUrl: '~/civicase/case/contact-case-tab/directives/contact-case-tab-case-details.directive.html',
      scope: {
        item: '=selectedCase',
        refreshCases: '=refreshCallback'
      }
    };
  });

  module.controller('CivicaseContactCaseTabCaseDetailsController', CivicaseContactCaseTabCaseDetailsController);

  /**
   * @param {object} $scope the scope reference.
   */
  function CivicaseContactCaseTabCaseDetailsController ($scope) {
    $scope.getCaseDetailsUrl = getCaseDetailsUrl;

    /**
     * Returns the URL needed to open the case details page for the given case.
     * The status id parameter is appended otherwise non "Opened" cases would be hidden
     * since the details page filters by "Opened" cases by default when no status is sent.
     *
     * @param {object} caseItem the case data.
     * @returns {string} the case details page url.
     */
    function getCaseDetailsUrl (caseItem) {
      return '/civicrm/case/a/#/case/list?caseId=' + caseItem.id +
        '&cf={"status_id":[' + caseItem.status_id + ']}';
    }
  }
})(angular, CRM.$, CRM._);
