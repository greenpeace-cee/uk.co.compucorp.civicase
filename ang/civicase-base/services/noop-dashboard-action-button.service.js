(function (_, angular) {
  var module = angular.module('civicase-base');

  module.service('NoOpDashboardActionButton', NoOpDashboardActionButton);

  /**
   * An Action button that does not execute any operation for their visibility and click
   * handler methods.
   */
  function NoOpDashboardActionButton () {
    this.clickHandler = _.noop;
    this.isVisible = _.noop;
  }
})(CRM._, angular);
