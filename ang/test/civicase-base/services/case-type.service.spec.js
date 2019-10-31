/* eslint-env jasmine */

(() => {
  describe('Case Type', () => {
    let CaseType, CaseTypesData;

    beforeEach(module('civicase', 'civicase.data'));

    beforeEach(inject((_CaseType_, _CaseTypesMockData_) => {
      CaseType = _CaseType_;
      CaseTypesData = _CaseTypesMockData_.get();
    }));

    describe('when getting all case types', () => {
      let returnedCaseTypes;

      beforeEach(() => {
        returnedCaseTypes = CaseType.getAll();
      });

      it('returns all the case types', () => {
        expect(returnedCaseTypes).toEqual(CaseTypesData);
      });
    });

    describe('when getting the titles for case types using their name', () => {
      let returnedTitles;

      beforeEach(() => {
        returnedTitles = CaseType.getTitlesForNames([
          'housing_support',
          'adult_day_care_referral'
        ]);
      });

      it('returns the title for the given case types', () => {
        expect(returnedTitles).toEqual([
          'Housing Support',
          'Adult Day Care Referral'
        ]);
      });
    });
  });
})();
