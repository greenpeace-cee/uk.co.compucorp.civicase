/* eslint-env jasmine */
(function ($) {
  describe('civicaseCaseCard', function () {
    var element, $compile, $rootScope, $route, $scope, CasesData;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data', function ($provide) {
      $route = { current: { params: {} } };

      $provide.value('$route', $route);
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_, _CasesData_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CasesData = _CasesData_.get();
    }));

    beforeEach(function () {
      compileDirective(CasesData.values[0]);
    });

    describe('basic test', function () {
      it('complies the case card directive', function () {
        expect(element.hasClass('civicase__case-card')).toBe(true);
      });
    });

    describe('toggleSelected()', function () {
      var originalEmitFunction;

      beforeEach(function () {
        originalEmitFunction = element.isolateScope().$emit;
        element.isolateScope().$emit = jasmine.createSpy('$emit');
      });

      afterEach(function () {
        element.isolateScope().$emit = originalEmitFunction;
      });

      describe('when selection is true', function () {
        beforeEach(function () {
          element.isolateScope().data.selected = true;
          element.isolateScope().toggleSelected();
        });

        it('sets selection to false', function () {
          expect(element.isolateScope().data.selected).toBe(false);
        });

        it('emits civicase::bulk-actions::check-box-toggled event', function () {
          expect(element.isolateScope().$emit).toHaveBeenCalledWith('civicase::bulk-actions::check-box-toggled', element.isolateScope().data);
        });
      });

      describe('when selection is false', function () {
        beforeEach(function () {
          element.isolateScope().data.selected = false;
          element.isolateScope().toggleSelected();
        });

        it('sets selection to true', function () {
          expect(element.isolateScope().data.selected).toBe(true);
        });

        it('emits civicase::bulk-actions::check-box-toggled event', function () {
          expect(element.isolateScope().$emit).toHaveBeenCalledWith('civicase::bulk-actions::check-box-toggled', element.isolateScope().data);
        });
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     * @param {Object} Case card object
     */
    function compileDirective (caseObj) {
      caseObj.allActivities = caseObj['api.Activity.get.1'].values;

      element = $compile('<civicase-case-card case="case"></civicase-case-card>')($scope);
      $scope.case = caseObj;
      $scope.$digest();
    }
  });
}(CRM.$));
