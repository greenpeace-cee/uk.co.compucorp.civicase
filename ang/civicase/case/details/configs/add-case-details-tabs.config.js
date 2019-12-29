(function (angular) {
  var module = angular.module('civicase');

  module.config(function (CaseDetailsTabsProvider, tsProvider) {
    var ts = tsProvider.$get();
    var caseTabsConfig = [
      { name: 'Summary', label: ts('Summary'), weight: 1 },
      { name: 'Activities', label: ts('Activities'), weight: 2 },
      { name: 'People', label: ts('People'), weight: 3 },
      { name: 'Files', label: ts('Files'), weight: 4 }
    ];

    CaseDetailsTabsProvider.addTabs(caseTabsConfig);
  });
})(angular);
