/* eslint-env jasmine */

(function (_, angular) {
  describe('Awards case type buttons', () => {
    let CaseTypeButtons, CaseTypeButtonsProvider;

    beforeEach(() => {
      initSpyModule('civicase.spy', ['civicase']);
      module('civicase', 'civicase.data', 'civicase.spy');
    });

    beforeEach(inject((_CaseTypeButtons_) => {
      CaseTypeButtons = _CaseTypeButtons_;
    }));

    describe('when no buttons have been defined', () => {
      it('returns an empty object', () => {
        expect(CaseTypeButtons).toEqual({});
      });
    });

    describe('when adding buttons to case types', () => {
      beforeEach(() => {
        CaseTypeButtonsProvider.addButtons('housing_support', [{
          url: 'http://housing_support.co.uk/'
        }]);
        CaseTypeButtonsProvider.addButtons('adult_day_care_referral', [{
          url: 'http://adult_day_care_referral.co.uk/'
        }]);
      });

      it('adds the corresponding button to housing support', () => {
        expect(CaseTypeButtons.housing_support).toEqual([{
          url: 'http://housing_support.co.uk/'
        }]);
      });

      it('adds the corresponding button to adult day care referral', () => {
        expect(CaseTypeButtons.adult_day_care_referral).toEqual([{
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
        .config((_CaseTypeButtonsProvider_) => {
          CaseTypeButtonsProvider = _CaseTypeButtonsProvider_;
        });
    }
  });
})(CRM._, angular);
