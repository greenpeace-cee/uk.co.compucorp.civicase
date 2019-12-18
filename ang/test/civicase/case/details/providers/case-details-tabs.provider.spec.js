/* eslint-env jasmine */
((_, angular) => {
  describe('CaseDetailsTabs', () => {
    let $injector, CaseDetailsTabs, CaseTabsMockData, CaseDetailsTabsProvider;
    const testTabToBeAdded = {
      name: 'Test',
      label: 'Test Label',
      weight: 5
    };

    beforeEach(() => {
      initSpyModule();
      module('civicase', 'civicase.data', 'civicase.spy');

      // initialises the modules:
      inject();
    });

    describe('when loading the case tabs', () => {
      let expectedCaseTabs;

      beforeEach(() => {
        injectDependencies();

        expectedCaseTabs = getExpectedCaseTabs();
      });

      it('it should have case details tabs sorted by weight and including their services', () => {
        expect(CaseDetailsTabs).toEqual(expectedCaseTabs);
      });
    });

    describe('when adding new case tabs', () => {
      let expectedCaseTabs;

      beforeEach(() => {
        CaseDetailsTabsProvider.addTabs([
          testTabToBeAdded
        ]);

        injectDependencies();

        expectedCaseTabs = getExpectedCaseTabs({
          extraCaseTabs: testTabToBeAdded
        });
      });

      it('displays the newly added tab sorted by weight', () => {
        expect(CaseDetailsTabs).toEqual(expectedCaseTabs);
      });
    });

    /**
     * Returns the case tabs as expected by the spec:
     *  - sorted by weight
     *  - including their service
     *
     * The function also supports adding extra case tabs to the list.
     *
     * @param {object} options a list of options.
     * @property {object[]} extraCaseTabs a list of case tabs to add.
     * @returns {object[]} a list of expected case tabs.
     */
    function getExpectedCaseTabs (options = { extraCaseTabs: [] }) {
      const expectedCaseTabs = CaseTabsMockData.concat(options.extraCaseTabs);

      return _.chain(expectedCaseTabs)
        .sortBy('weight')
        .map((caseTab) => {
          const caseTabService = $injector.get(`${caseTab.name}CaseTab`);

          return _.extend({}, caseTab, {
            service: caseTabService
          });
        })
        .value();
    }

    /**
     * Initialises a spy module by hoisting the case details tabs provider
     * and adding a mock TestCaseTab service.
     */
    function initSpyModule () {
      angular.module('civicase.spy', ['civicase'])
        .config((_CaseDetailsTabsProvider_) => {
          CaseDetailsTabsProvider = _CaseDetailsTabsProvider_;
        })
        .service('TestCaseTab', function () {
          this.getPlaceholderUrl = _.noop;
          this.activeTabContentUrl = _.noop;
        });
    }

    /**
     * Injects and hoists the dependencies needed by this spec.
     */
    function injectDependencies () {
      inject((_$injector_, _CaseDetailsTabs_, _CaseTabsMockData_) => {
        $injector = _$injector_;
        CaseDetailsTabs = _CaseDetailsTabs_;
        CaseTabsMockData = _.cloneDeep(_CaseTabsMockData_);
      });
    }
  });
})(CRM._, angular);
