/* eslint-env jasmine */

(function (_, angular) {
  describe('civicaseDashboardController', () => {
    let CaseTypes, CaseTypesProvider, CaseTypesMockData;

    beforeEach(() => {
      initSpyModule('civicase.spy', ['civicase']);
      module('civicase', 'civicase.data', 'civicase.spy');
    });

    beforeEach(inject((_CaseTypes_, _CaseTypesMockData_) => {
      CaseTypes = _CaseTypes_;
      CaseTypesMockData = _.map(_CaseTypesMockData_.get());
      CaseTypesMockData[0].buttons = [];
      CaseTypesMockData[1].buttons = [];
    }));

    describe('when the case types are requested', () => {
      it('returns a list of case types with an empty list of buttons', () => {
        expect(CaseTypes).toEqual(CaseTypesMockData);
      });
    });

    describe('when adding buttons to case types', () => {
      beforeEach(() => {
        CaseTypesProvider.addButtons([
          {
            caseTypeName: 'housing_support',
            buttons: [{
              url: 'http://housing_support.co.uk/'
            }]
          },
          {
            caseTypeName: 'adult_day_care_referral',
            buttons: [{
              url: 'http://adult_day_care_referral.co.uk/'
            }]
          }
        ]);
      });

      it('adds the corresponding button to housing support', () => {
        expect(CaseTypes[0].buttons).toEqual([{
          url: 'http://housing_support.co.uk/'
        }]);
      });

      it('adds the corresponding button to adult day care referral', () => {
        expect(CaseTypes[1].buttons).toEqual([{
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
        .config((_CaseTypesProvider_) => {
          CaseTypesProvider = _CaseTypesProvider_;
        });
    }
  });
})(CRM._, angular);
