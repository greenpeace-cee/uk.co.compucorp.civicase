/* eslint-env jasmine */
((_) => {
  describe('CaseDetailsTabs', () => {
    let CaseDetailsTabs, $rootScope, $controller, $scope, CaseTabsMockData, CaseDetailsTabsProvider;
    const newTabsToBeAdded = [
      {
        name: 'test',
        label: 'Test Label',
        weight: 5
      }
    ];

    beforeEach(module('civicase', 'civicase.data', (_CaseDetailsTabsProvider_) => {
      CaseDetailsTabsProvider = _CaseDetailsTabsProvider_;
    }));

    beforeEach(inject((_$rootScope_, _$controller_, _CaseDetailsTabs_, _CaseTabsMockData_) => {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CaseDetailsTabs = _CaseDetailsTabs_;
      CaseTabsMockData = _.cloneDeep(_CaseTabsMockData_);
    }));

    describe('Case tabs', () => {
      beforeEach(() => {
        initController();
      });

      it('should gets tabs object', () => {
        expect(CaseDetailsTabs).toEqual(CaseTabsMockData);
      });
    });

    describe('when a new case tab is added', () => {
      let expectedCaseTabs;

      beforeEach(() => {
        expectedCaseTabs = CaseTabsMockData.concat(newTabsToBeAdded);
        expectedCaseTabs = _.sortBy(expectedCaseTabs, 'weight');

        initController();
        CaseDetailsTabsProvider.addTabs(newTabsToBeAdded);
      });

      it('displays the newly added tab sorted by weight', () => {
        expect(CaseDetailsTabsProvider.$get()).toEqual(expectedCaseTabs);
      });
    });

    /**
     * Initializes the case details controller.
     *
     * @param {object} caseItem a case item to pass to the controller. Defaults to
     * a case from the mock data.
     */
    function initController (caseItem) {
      $scope = $rootScope.$new();

      $controller('civicaseCaseDetailsController', {
        $scope: $scope
      });

      $scope.$digest();
    }
  });
})(CRM._);
