(function (angular, CRM) {
  var module = angular.module('civicase.data');
  var CaseTabs;

  CaseTabs = [
    {
      name: 'summary',
      label: 'Summary',
      weight: 1
    },
    {
      name: 'activities',
      label: 'Activities',
      weight: 2
    },
    {
      name: 'people',
      label: 'People',
      weight: 3
    },
    {
      name: 'files',
      label: 'Files',
      weight: 4
    }
  ];

  module.constant('CaseTabsMockData', CaseTabs);
})(angular, CRM);
