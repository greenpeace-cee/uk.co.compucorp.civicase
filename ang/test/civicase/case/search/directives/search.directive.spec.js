/* eslint-env jasmine */
(function ($, _) {
  describe('civicaseSearch', function () {
    var $controller, $rootScope, $scope, CaseFilters, CaseStatuses, CaseTypes, crmApi, affixOriginalFunction,
      offsetOriginalFunction, originalDoSearch, orginalParentScope, affixReturnValue,
      originalBindToRoute;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data', function ($provide) {
      crmApi = jasmine.createSpy('crmApi');

      $provide.value('crmApi', crmApi);
    }));

    beforeEach(inject(function (_$controller_, $q, _$rootScope_, _CaseFilters_, _CaseStatuses_, _CaseTypes_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CaseFilters = _CaseFilters_;
      CaseStatuses = _CaseStatuses_.values;
      CaseTypes = _CaseTypes_.get();

      crmApi.and.returnValue($q.resolve({ values: [] }));
    }));

    beforeEach(function () {
      affixOriginalFunction = CRM.$.fn.affix;
      offsetOriginalFunction = CRM.$.fn.offset;

      CRM.$.fn.offset = function () {
        return { top: 100 };
      };

      CRM.$.fn.affix = jasmine.createSpy('affix');
      affixReturnValue = jasmine.createSpyObj('affix', ['on']);
      affixReturnValue.on.and.returnValue(affixReturnValue);
      CRM.$.fn.affix.and.returnValue(affixReturnValue);
      originalBindToRoute = $scope.$bindToRoute;
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');

      initController();
    });

    afterEach(function () {
      CRM.$.fn.affix = affixOriginalFunction;
      CRM.$.fn.offset = offsetOriginalFunction;
      $scope.$bindToRoute = originalBindToRoute;
    });

    describe('$scope variables', function () {
      it('checks $scope.caseTypeOptions', function () {
        expect($scope.caseTypeOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.caseStatusOptions', function () {
        expect($scope.caseStatusOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.customGroups', function () {
        expect($scope.customGroups).toEqual(jasmine.any(Object));
      });

      it('checks $scope.caseRelationshipOptions', function () {
        expect($scope.caseRelationshipOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.checkPerm', function () {
        expect($scope.checkPerm).toEqual(jasmine.any(Function));
      });

      it('checks $scope.filterDescription', function () {
        expect($scope.filterDescription).toEqual(jasmine.any(Array));
      });

      it('checks $scope.filters', function () {
        expect($scope.filterDescription).toEqual(jasmine.any(Object));
      });
    });

    describe('watchers', function () {
      describe('when updating the relationship types', function () {
        describe('when I am the case manager', function () {
          beforeEach(function () {
            $scope.relationshipType = ['is_case_manager'];
            $scope.$digest();
          });

          it('sets the case manager filter equal to my id', function () {
            expect($scope.filters.case_manager).toEqual([CRM.config.user_contact_id]);
          });
        });

        describe('when I am involved in the case', function () {
          beforeEach(function () {
            $scope.relationshipType = ['is_involved'];
            $scope.$digest();
          });

          it('sets the contact id filter equal to my id', function () {
            expect($scope.filters.contact_involved).toEqual([CRM.config.user_contact_id]);
          });
        });
      });

      describe('$scope.filters', function () {
        beforeEach(function () {
          originalDoSearch = $scope.doSearch;
          $scope.doSearch = jasmine.createSpy('doSearch');
          $scope.filters = CaseFilters.filter;
        });

        afterEach(function () {
          $scope.doSearch = originalDoSearch;
        });

        describe('when $scope.expanded is false', function () {
          beforeEach(function () {
            $scope.expanded = false;
            $scope.$digest();
          });
          it('calls $scope.doSearch()', function () {
            expect($scope.doSearch).toHaveBeenCalled();
          });
        });
        describe('when $scope.expanded is true', function () {
          beforeEach(function () {
            $scope.expanded = true;
            $scope.$digest();
          });
          it('does not calls $scope.doSearch()', function () {
            expect($scope.doSearch).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('caseManagerIsMe()', function () {
      describe('when case_manager is me', function () {
        beforeEach(function () {
          $scope.filters.case_manager = [203];
        });

        it('should return true', function () {
          expect($scope.caseManagerIsMe()).toBe(true);
        });
      });

      describe('when case_manager is not me', function () {
        describe('when case id is different', function () {
          beforeEach(function () {
            $scope.filters.case_manager = [201];
          });

          it('should return false', function () {
            expect($scope.caseManagerIsMe()).toBe(false);
          });
        });

        describe('when case id undefined', function () {
          beforeEach(function () {
            $scope.filters.case_manager = undefined;
          });

          it('should return undefined', function () {
            expect($scope.caseManagerIsMe()).toBeUndefined();
          });
        });
      });
    });

    describe('doSearch()', function () {
      beforeEach(function () {
        orginalParentScope = $scope.$parent;
        $scope.$parent = {};
      });

      beforeEach(function () {
        $scope.expanded = true;
        $scope.filters.case_manager = [203];
        $scope.doSearch();
      });

      afterEach(function () {
        $scope.$parent = orginalParentScope;
      });

      it('should build filter description', function () {
        expect($scope.filterDescription).toEqual([{ label: 'Case Manager', text: 'Me' }]);
      });

      it('should close the dropdown', function () {
        expect($scope.expanded).toBe(false);
      });
    });

    describe('clearSearch()', function () {
      beforeEach(function () {
        originalDoSearch = $scope.doSearch;
        $scope.doSearch = jasmine.createSpy('doSearch');
        $scope.filters = CaseFilters.filter;
        $scope.clearSearch();
      });

      afterEach(function () {
        $scope.doSearch = originalDoSearch;
      });

      it('clears filters object', function () {
        expect($scope.filters).toEqual({});
      });

      it('calls doSearch()', function () {
        expect($scope.doSearch).toHaveBeenCalled();
      });
    });

    describe('mapSelectOptions()', function () {
      it('returns a mapped response', function () {
        expect($scope.caseTypeOptions[0]).toEqual(jasmine.objectContaining({ id: jasmine.any(String), text: jasmine.any(String), color: jasmine.any(String), icon: jasmine.any(String) }));
      });
    });

    describe('updating the search title', () => {
      const updateTitleEventName = 'civicase::case-search::page-title-updated';

      describe('when a case has been selected to be displayed', () => {
        const caseName = 'Housing Support';

        beforeEach(() => {
          $scope.$emit(updateTitleEventName, caseName);
        });

        it('sets the title equal to the provided case name', () => {
          expect($scope.pageTitle).toEqual(caseName);
        });
      });

      describe('when no cases have been selected', () => {
        describe('when no filters have been applied', () => {
          beforeEach(() => {
            $scope.filters = {};

            $scope.$emit(updateTitleEventName);
          });

          it('displays an "all open cases" title', () => {
            expect($scope.pageTitle).toEqual('All Open  Cases');
          });
        });

        describe('when cases are filtered by case type category', () => {
          beforeEach(() => {
            $scope.filters = {
              case_type_category: '1'
            };

            $scope.$emit(updateTitleEventName);
          });

          it('displays an "all open cases" title', () => {
            expect($scope.pageTitle).toEqual('All Open  Cases');
          });
        });

        describe('when there are filters not used for describing the title', () => {
          beforeEach(() => {
            $scope.filters = [{ case_manager: [1] }];

            $scope.$emit(updateTitleEventName);
          });

          it('displays a "catch all" title for all extra filters', () => {
            expect($scope.pageTitle).toEqual('Case Search Results');
          });
        });

        describe('when the filters can be used to describe the title', () => {
          let expectedTitle;

          describe('when filtering only by case statuses', () => {
            beforeEach(() => {
              expectedTitle = `${CaseStatuses['1'].label} & ${CaseStatuses['2'].label}  Cases`;
              $scope.filters = {
                status_id: [
                  CaseStatuses['1'].value,
                  CaseStatuses['2'].value
                ]
              };

              $scope.$emit(updateTitleEventName);
            });

            it('displays title for the statuses', () => {
              expect($scope.pageTitle).toEqual(expectedTitle);
            });
          });

          describe('when filtering only by case types', () => {
            beforeEach(() => {
              expectedTitle = `All Open ${CaseTypes['1'].title} & ${CaseTypes['2'].title} Cases`;
              $scope.filters = {
                case_type_id: [
                  CaseTypes['1'].name,
                  CaseTypes['2'].name
                ]
              };

              $scope.$emit(updateTitleEventName);
            });

            it('displays a title for the case types', () => {
              expect($scope.pageTitle).toEqual(expectedTitle);
            });
          });

          describe('when filtering by both case statuses and case types', () => {
            beforeEach(() => {
              expectedTitle = `${CaseStatuses['1'].label} & ${CaseStatuses['2'].label}` +
                ` ${CaseTypes['1'].title} & ${CaseTypes['2'].title} Cases`;
              $scope.filters = {
                status_id: [
                  CaseStatuses['1'].value,
                  CaseStatuses['2'].value
                ],
                case_type_id: [
                  CaseTypes['1'].name,
                  CaseTypes['2'].name
                ]
              };

              $scope.$emit(updateTitleEventName);
            });

            it('displays a title for the case statuses and case types', () => {
              expect($scope.pageTitle).toEqual(expectedTitle);
            });
          });
        });

        describe('when a case count is provided', () => {
          const randomCount = _.random(0, 1000);

          beforeEach(() => {
            $scope.$emit(updateTitleEventName, null, randomCount);
          });

          it('adds the count at the end of the title', () => {
            expect($scope.pageTitle).toEqual(`All Open  Cases (${randomCount})`);
          });
        });
      });
    });

    /**
     * Initiate controller
     */
    function initController () {
      $scope.filters = {};
      $scope.searchIsOpentrue = true;
      $scope.applyAdvSearch = function () { };
      $controller('civicaseSearchController', {
        $scope: $scope
      });
    }
  });
}(CRM.$, CRM._));
