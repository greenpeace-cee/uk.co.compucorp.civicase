(function (angular, $, _) {
  var module = angular.module('civicase');

  module.provider('CaseTabs', CaseTabsProvider);

  /**
   *
   */
  function CaseTabsProvider () {
    var caseTabsConfig = [
      { name: 'summary', label: ts('Summary'), weight: 1 },
      { name: 'activities', label: ts('Activities'), weight: 2 },
      { name: 'people', label: ts('People'), weight: 3 },
      { name: 'files', label: ts('Files'), weight: 4 }
    ];

    /**
     * Getter for caseTabs Provider.
     * Sorts the caseTabsConfig before returning.
     */
    this.$get = function () {
      return Object.keys(caseTabsConfig).sort(function (a, b) {
        return caseTabsConfig[a].weight - caseTabsConfig[b].weight;
      }).map(function (key) {
        return caseTabsConfig[key];
      });
    };

    /**
     * Setter for caseTabsConfig.
Adds a new caseTab config to the list of configs.
     *
     * @param tabConfig
     * @param {object} case tab config.
     */
    this.addTabs = function (tabConfig) {
      caseTabsConfig = caseTabsConfig.concat(tabConfig);
    };
  }
})(angular, CRM.$, CRM._);
