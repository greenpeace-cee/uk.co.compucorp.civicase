/* eslint-env jasmine */

(function (_, angular) {
  describe('DashboardCaseTypeButtons', () => {
    let DashboardCaseTypeButtons, DashboardCaseTypeButtonsProvider;

    beforeEach(() => {
      initSpyModule('civicase.spy', ['civicase']);
      module('civicase', 'civicase.data', 'civicase.spy');
    });

    beforeEach(inject((_DashboardCaseTypeButtons_) => {
      DashboardCaseTypeButtons = _DashboardCaseTypeButtons_;
    }));

    describe('when no buttons have been defined', () => {
      it('returns an empty object', () => {
        expect(DashboardCaseTypeButtons).toEqual({});
      });
    });

    describe('when adding buttons to case types', () => {
      beforeEach(() => {
        DashboardCaseTypeButtonsProvider.addButtons('housing_support', [{
          url: 'http://housing_support.co.uk/'
        }]);
        DashboardCaseTypeButtonsProvider.addButtons('adult_day_care_referral', [{
          url: 'http://adult_day_care_referral.co.uk/'
        }]);
      });

      it('adds the corresponding button to housing support', () => {
        expect(DashboardCaseTypeButtons.housing_support).toEqual([{
          url: 'http://housing_support.co.uk/'
        }]);
      });

      it('adds the corresponding button to adult day care referral', () => {
        expect(DashboardCaseTypeButtons.adult_day_care_referral).toEqual([{
          url: 'http://adult_day_care_referral.co.uk/'
        }]);
      });
    });

    /**
     * Initialises the spy module that hoists the Case Types provider.
     *
     * @param {string} spyModuleName the name for the spy module
     * @param {string[]} spyModuleRequirements a list of required modules for the spy module
     */
    function initSpyModule (spyModuleName, spyModuleRequirements) {
      angular.module(spyModuleName, spyModuleRequirements)
        .config((_DashboardCaseTypeButtonsProvider_) => {
          DashboardCaseTypeButtonsProvider = _DashboardCaseTypeButtonsProvider_;
        });
    }
  });
})(CRM._, angular);
