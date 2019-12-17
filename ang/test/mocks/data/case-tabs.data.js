(function (angular, CRM) {
  var module = angular.module('civicase.data');
  var CaseTabs;

  CaseTabs = [
    {
      name: 'Summary',
      label: 'Summary',
      weight: 1
    },
    {
      name: 'Activities',
      label: 'Activities',
      weight: 2
    },
    {
      name: 'People',
      label: 'People',
      weight: 3
    },
    {
      name: 'Files',
      label: 'Files',
      weight: 4
    }
  ];

  module.constant('CaseTabsMockData', CaseTabs);
})(angular, CRM);
