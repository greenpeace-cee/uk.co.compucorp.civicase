/* eslint-env jasmine */

(() => {
  describe('Dashboard Action Buttons', () => {
    let DashboardActionButtonsProvider;

    beforeEach(() => {
      module('civicase-base', (_DashboardActionButtonsProvider_) => {
        DashboardActionButtonsProvider = _DashboardActionButtonsProvider_;

        spyOn(DashboardActionButtonsProvider, 'addButtons');
      });

      module('civicase');
      inject();
    });

    describe('when the dashboard configurations runs', () => {
      it('adds the Add Case action button', () => {
        expect(DashboardActionButtonsProvider.addButtons)
          .toHaveBeenCalledWith(jasmine.arrayContaining([{
            buttonClass: 'btn btn-primary civicase__dashboard__action-btn',
            iconClass: 'add_circle',
            identifier: 'AddCase',
            label: 'Add Case',
            weight: 0
          }]));
      });
    });
  });
})();
