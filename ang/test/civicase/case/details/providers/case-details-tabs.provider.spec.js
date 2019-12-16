/* eslint-env jasmine */
(function (_) {
  describe('CaseDetailsTabs', function () {
    var CaseDetailsTabs, $rootScope, $controller, $scope, CaseTabsMockData, CaseDetailsTabsProvider;
    var CaseTab = [{
      name: 'test',
      label: 'Test Label',
      weight: 5
    }];

    beforeEach(module('civicase', 'civicase.data', function (_CaseDetailsTabsProvider_) {
      CaseDetailsTabsProvider = _CaseDetailsTabsProvider_;
    }));

    beforeEach(inject(function (_$rootScope_, _$controller_, _CaseDetailsTabs_, _CaseTabsMockData_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CaseDetailsTabs = _CaseDetailsTabs_;
      CaseTabsMockData = _.cloneDeep(_CaseTabsMockData_);
    }));

    describe('Case tabs', function () {
      beforeEach(function () {
        initController();
      });

      it('should gets tabs object', function () {
        expect(CaseDetailsTabs).toEqual(CaseTabsMockData);
      });
    });

    describe('Case tabs add function', function () {
      beforeEach(function () {
        initController();
        CaseDetailsTabsProvider.addTabs(CaseTab);

        // Add case tab to mock data
        CaseTabsMockData = CaseTabsMockData.concat(CaseTab);

        // And filter
        CaseTabsMockData = Object.keys(CaseTabsMockData).sort(function (a, b) {
          return CaseTabsMockData[a].weight - CaseTabsMockData[b].weight;
        }).map(function (key) {
          return CaseTabsMockData[key];
        });
      });

      it('should add new Object to the list', function () {
        expect(CaseDetailsTabsProvider.$get()).toEqual(CaseTabsMockData);
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
