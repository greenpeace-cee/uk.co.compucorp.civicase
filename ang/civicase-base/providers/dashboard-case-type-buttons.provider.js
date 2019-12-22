(function (angular, $, _) {
  var module = angular.module('civicase-base');

  module.provider('DashboardCaseTypeButtons', function () {
    var dashboardCaseTypeButtons = {};

    this.$get = $get;
    this.addButtons = addButtons;

    /**
     * Provides the case type buttons.
     *
     * @returns {object} a map of case type names and the buttons associated
     *   to them.
     */
    function $get () {
      return dashboardCaseTypeButtons;
    }

    /**
     * Adds the given buttons to their corresponding case types. These buttons will be shown
     * in the list of case types on the dashboard.
     *
     * @typedef {{
     *  icon: string,
     *  url: string
     * }} ButtonConfig
     * @param {string} caseTypeName the name for the case type the buttons belong to.
     * @param {ButtonConfig[]} buttonsConfig a list of case type buttons configurations.
     */
    function addButtons (caseTypeName, buttonsConfig) {
      var areButtonsDefined = !!dashboardCaseTypeButtons[caseTypeName];

      if (!areButtonsDefined) {
        dashboardCaseTypeButtons[caseTypeName] = [];
      }

      dashboardCaseTypeButtons[caseTypeName] = dashboardCaseTypeButtons[caseTypeName]
        .concat(buttonsConfig);
    }
  });
})(angular, CRM.$, CRM._);
