/* eslint-env jasmine */

(() => {
  describe('Contact Case Tab Case Details', () => {
    let $controller, $rootScope, $scope, mockCase;

    beforeEach(module('civicase', 'civicase.data'));

    beforeEach(inject((_$controller_, _$rootScope_, _CasesData_, _crmApi_) => {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      mockCase = _CasesData_.get().values[0];

      initController();
    }));

    describe('when requesting the case details page URL', () => {
      let expectedUrl, returnedUrl;

      beforeEach(() => {
        expectedUrl = '/civicrm/case/a/#/case/list' +
          `?caseId=${mockCase.id}&cf={"status_id":[${mockCase.status_id}]}`;
        returnedUrl = $scope.getCaseDetailsUrl(mockCase);
      });

      it('returns the case details page url for the given case', () => {
        expect(returnedUrl).toEqual(expectedUrl);
      });
    });

    /**
     * Initializes the contact case tab case details controller.
     */
    function initController () {
      $scope = $rootScope.$new();

      $controller('CivicaseContactCaseTabCaseDetailsController', { $scope: $scope });
    }
  });
})();
