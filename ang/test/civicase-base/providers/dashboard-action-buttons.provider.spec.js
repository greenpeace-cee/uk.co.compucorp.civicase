/* eslint-env jasmine */

(function (_, angular) {
  describe('DashboardActionButtons', () => {
    let DashboardActionButtons, DashboardActionButtonsProvider, NoOpDashboardActionButton,
      MockDashboardActionButton;

    beforeEach(() => {
      initSpyModule();
      module('civicase-base', 'civicase.data', 'civicase.spy');

      // This will initialise the modules:
      inject();
    });

    describe('when no buttons have been defined', () => {
      beforeEach(() => {
        injectDependencies();
      });

      it('returns an empty array', () => {
        expect(DashboardActionButtons).toEqual([]);
      });
    });

    describe('when adding action buttons to the dashboard', () => {
      const actionButtonWithService = {
        buttonClass: 'btn-1-class',
        iconClass: 'icon-1-class',
        identifier: 'Mock',
        label: 'Button with service',
        weight: 2
      };
      const actionButtonWithoutService = {
        buttonClass: 'btn-2-class',
        iconClass: 'icon-2-class',
        identifier: 'None',
        label: 'Button without service',
        weight: 3
      };
      const firstActionButton = {
        buttonClass: 'btn-3-class',
        iconClass: 'icon-3-class',
        identifier: 'None',
        label: 'Should be first',
        weight: 1
      };

      beforeEach(() => {
        DashboardActionButtonsProvider.addButtons([
          actionButtonWithService,
          actionButtonWithoutService,
          firstActionButton
        ]);
        injectDependencies();
      });

      it('adds the action button with service', () => {
        expect(DashboardActionButtons)
          .toContain(jasmine.objectContaining(actionButtonWithService));
      });

      it('adds the action button without service', () => {
        expect(DashboardActionButtons)
          .toContain(jasmine.objectContaining(actionButtonWithoutService));
      });

      it('includes the mock action button service for the action button with service', () => {
        expect(DashboardActionButtons)
          .toContain(_.extend({}, actionButtonWithService, {
            service: MockDashboardActionButton
          }));
      });

      it('includes a no operation action button service for the action button without service', () => {
        expect(DashboardActionButtons)
          .toContain(_.extend({}, actionButtonWithoutService, {
            service: NoOpDashboardActionButton
          }));
      });

      it('sorts the action buttons by weight', () => {
        expect(DashboardActionButtons).toEqual([
          jasmine.objectContaining(firstActionButton),
          jasmine.objectContaining(actionButtonWithService),
          jasmine.objectContaining(actionButtonWithoutService)
        ]);
      });
    });

    /**
     * Injects and hoists all the dependencies needed by the spec file.
     */
    function injectDependencies () {
      inject((_DashboardActionButtons_, _NoOpDashboardActionButton_,
        _MockDashboardActionButton_) => {
        DashboardActionButtons = _DashboardActionButtons_;
        NoOpDashboardActionButton = _NoOpDashboardActionButton_;
        MockDashboardActionButton = _MockDashboardActionButton_;
      });
    }

    /**
     * Initialises the spy module that hoists the Dashboard Action Buttons provider.
     * It also defines a MockDashboardActionButton service to test the inclusion of
     * action button services.
     */
    function initSpyModule () {
      angular.module('civicase.spy', ['civicase-base'])
        .config((_DashboardActionButtonsProvider_) => {
          DashboardActionButtonsProvider = _DashboardActionButtonsProvider_;
        })
        .service('MockDashboardActionButton', function () {
          this.clickHandler = () => {};
          this.isVisible = () => {};
        });
    }
  });
})(CRM._, angular);
