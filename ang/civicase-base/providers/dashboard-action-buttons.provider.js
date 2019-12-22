(function (angular, $, _) {
  var module = angular.module('civicase-base');

  module.provider('DashboardActionButtons', function () {
    var dashboardActionButtons = [];

    this.$get = $get;
    this.addButtons = addButtons;

    /**
     * Provides the dashboard action buttons. These include their services.
     * The buttons are sorted by their weight.
     *
     * @param {object} $injector Angular's injector service.
     * @param {DashboardActionService} NoOpDashboardActionButton An action button service that does not execute any code.
     * @returns {object[]} the list of case types.
     */
    function $get ($injector, NoOpDashboardActionButton) {
      var dashboardActionButtonsWithServices = getDashboardActionButtonsWithServices();
      dashboardActionButtonsWithServices = _.sortBy(
        dashboardActionButtonsWithServices,
        'weight'
      );

      return dashboardActionButtonsWithServices;

      /**
       * Returns all defined dashboard action buttons, and also includes the service related to them.
       * If no service can be found a No Operation service is added by default.
       *
       * @returns {ButtonConfigWithService[]} a list of button configurations including their services.
       */
      function getDashboardActionButtonsWithServices () {
        return dashboardActionButtons.map(function (actionButton) {
          var service = getDashboardActionButtonService(actionButton.identifier);

          if (!service) {
            service = NoOpDashboardActionButton;
          }

          return _.extend({}, actionButton, {
            service: service
          });
        });
      }

      /**
       * Returns the corresponding service for the given button identifier.
       *
       * @param {string} buttonIdentifier the button identifier property.
       * @returns {object|null} a service or null.
       */
      function getDashboardActionButtonService (buttonIdentifier) {
        try {
          return $injector.get(buttonIdentifier + 'DashboardActionButton');
        } catch (e) {
          return null;
        }
      }
    }

    /**
     * Adds the given dashboard action buttons to the list.
     *
     * @param {ButtonConfig[]} buttonsConfig a list of dashboard action button configurations.
     */
    function addButtons (buttonsConfig) {
      dashboardActionButtons = dashboardActionButtons.concat(buttonsConfig);
    }
  });
})(angular, CRM.$, CRM._);

/**
 * @typedef {object} ButtonConfig
 * @property {string} buttonClass
 * @property {string} iconClass
 * @property {string} identifier
 * @property {string} label
 * @property {number} weight
 *
 * @typedef {ButtonConfig} ButtonConfigWithService
 * @property {DashboardActionService} service
 *
 * @typedef {object} DashboardActionService
 * @property {() => void} clickHandler
 * @property {() => boolean} isVisible
 */
