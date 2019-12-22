(function (angular, configuration) {
  var module = angular.module('civicase-base');

  module
    .constant('allowCaseLocks', configuration.allowCaseLocks)
    .constant('allowMultipleCaseClients', configuration.allowMultipleCaseClients)
    .constant('defaultCaseCategory', configuration.defaultCaseCategory)
    .constant('newCaseWebformClient', configuration.newCaseWebformClient)
    .constant('newCaseWebformUrl', configuration.newCaseWebformUrl);
})(angular, CRM['civicase-base']);
