(function (angular) {
  var module = angular.module('civicase');

  module.config(function (DashboardActionButtonsProvider, tsProvider) {
    var ts = tsProvider.$get();
    var actionButtons = [
      {
        buttonClass: 'btn btn-primary civicase__dashboard__action-btn',
        iconClass: 'add_circle',
        identifier: 'AddCase',
        label: ts('Add Case'),
        weight: 0
      }
    ];

    DashboardActionButtonsProvider.addButtons(actionButtons);
  });
})(angular);
