/* eslint-env jasmine */
((_, angular) => {
  describe('CaseDetailsTabs', () => {
    let CaseDetailsTabsProvider;

    beforeEach(module('civicase-base', (_CaseDetailsTabsProvider_) => {
      CaseDetailsTabsProvider = _CaseDetailsTabsProvider_;

      spyOn(CaseDetailsTabsProvider, 'addTabs');
    }));

    beforeEach(module('civicase'));

    describe('when the case tabs are being configured', () => {
      beforeEach(() => {
        inject();
      });

      it('it adds the summary, activities, people, and files tabs', () => {
        expect(CaseDetailsTabsProvider.addTabs).toHaveBeenCalledWith([
          { name: 'Summary', label: ts('Summary'), weight: 1 },
          { name: 'Activities', label: ts('Activities'), weight: 2 },
          { name: 'People', label: ts('People'), weight: 3 },
          { name: 'Files', label: ts('Files'), weight: 4 }
        ]);
      });
    });
  });
})(CRM._, angular);
