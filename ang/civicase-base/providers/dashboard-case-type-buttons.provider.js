(function (angular, $, _) {
  var module = angular.module('civicase-base');

  module.provider('DashboardCaseTypeButtons', function () {
    var dashboardCaseTypeButtons = {};

    this.addButtons = addButtons;
    this.$get = $get;

    /**
     * Provides the case types.
     *
     * @returns {object[]} the list of case types.
     */
    function $get () {
      return dashboardCaseTypeButtons;
    }

    /**
     * Adds the given buttons to their corresponding case types. These buttons will be shown
     * in the list of case types on the dashboard.
     *
     * @typedef {{
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
