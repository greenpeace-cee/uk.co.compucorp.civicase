(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseOverview', function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '~/civicase/case/directives/case-overview.directive.html',
      controller: civicaseCaseOverviewController,
      scope: {
        caseFilter: '<'
      },
      link: civicaseCaseOverviewLink
    };

    /**
     * Link function for civicaseCaseOverview
     *
<<<<<<< HEAD
     * @param {object} $scope scope object
     * @param {object} element the directive element
     * @param {object} attrs attributes of the directive
=======
     * @param {object} $scope the directive's $scope object.
     * @param {object} element the directive's element reference.
     * @param {object} attrs the directive's element attributes.
>>>>>>> RSE-364: Fix lint issues
     */
    function civicaseCaseOverviewLink ($scope, element, attrs) {
      (function init () {
        $scope.$watch('showBreakdown', recalculateScrollbarPosition);
      }());

      /**
       * Watchers for showBreakdown variable
       */
      function recalculateScrollbarPosition () {
        $scope.$emit('civicase::custom-scrollbar::recalculate');
      }
    }
  });

  module.controller('civicaseCaseOverviewController', civicaseCaseOverviewController);

  /**
   * Controller for civicaseCaseOverview.
   *
   * @param {object} $scope the controller's $scope object.
   * @param {object} crmApi the crm api service reference.
   * @param {object} BrowserCache the browser cache service reference.
   * @param {object} CaseStatus the case status service reference.
   * @param {object} CaseTypeCategory the case type category service reference.
   * @param {object} CaseType the case type service reference.
   */
  function civicaseCaseOverviewController ($scope, crmApi, BrowserCache, CaseStatus, CaseTypeCategory, CaseType) {
    var BROWSER_CACHE_IDENTIFIER = 'civicase.CaseOverview.hiddenCaseStatuses';
    var caseTypes = CaseType.getAll();
    var caseTypeCategories = CaseTypeCategory.getAll();

    $scope.summaryData = [];
    $scope.caseStatuses = _.chain(CaseStatus.getAll())
      .sortBy(function (status) { return status.weight; })
      .indexBy('weight')
      .value();

    (function init () {
      setCaseTypesBasedOnCategory();
      // We hide the breakdown when there's only one case type
      if ($scope.caseTypesLength < 2) {
        $scope.showBreakdown = false;
      }

      $scope.$watch('caseFilter', caseFilterWatcher, true);
      loadHiddenCaseStatuses();
    }());

    /**
     * Checks if all statuses are hidden
     *
     * @returns {boolean} true when all statuses are hidden.
     */
    $scope.areAllStatusesHidden = function () {
      return _.filter($scope.caseStatuses, function (status) {
        return !status.isHidden;
      }).length === 0;
    };

    /**
     * Creates link to the filtered cases list
     *
     * @param {string} type the case type
     * @param {string} status the case's status.
     * @returns {string} link to the filtered list of cases
     */
    $scope.caseListLink = function (type, status) {
      var cf = {};

      if (type) {
        cf.case_type_id = [type];
      }

      if (status) {
        cf.status_id = [status];
      }

      if ($scope.myCasesOnly) {
        cf.case_manager = [CRM.config.user_contact_id];
      }

      return '#/case/list?' + $.param({ cf: JSON.stringify(cf) });
    };

    /**
     * Toggle status view
     *
     * @param {document#event:mousedown} $event the toggle DOM event.
     * @param {number} index of the case status
     */
    $scope.toggleStatusVisibility = function ($event, index) {
      $scope.caseStatuses[index + 1].isHidden = !$scope.caseStatuses[index + 1].isHidden;
      storeHiddenCaseStatuses();
      $event.stopPropagation();
    };

    /**
     * Toggles the visibility of the breakdown dropdown
     */
    $scope.toggleBrekdownVisibility = function () {
      $scope.showBreakdown = !$scope.showBreakdown;
    };

    /**
     * Watcher function for caseFilter
     */
    function caseFilterWatcher () {
      setCaseTypesBasedOnCategory();
      loadStatsData();
    }

    /**
     * Loads from the browser cache the ids of the case status that have been
     * previously hidden and marks them as such.
     */
    function loadHiddenCaseStatuses () {
      var hiddenCaseStatuses = BrowserCache.get(BROWSER_CACHE_IDENTIFIER, []);

      hiddenCaseStatuses.forEach(function (caseStatusId) {
        $scope.caseStatuses[caseStatusId].isHidden = true;
      });
    }

    /**
     * Loads Stats data
     */
    function loadStatsData () {
      var apiCalls = [];

      apiCalls.push(['Case', 'getstats', $scope.caseFilter || {}]);
      crmApi(apiCalls).then(function (response) {
        $scope.summaryData = response[0].values;
      });
    }

    /**
     * Sets the Case Types Based on Case Type Category
     */
    function setCaseTypesBasedOnCategory () {
      var filteredCaseTypes = $scope.caseFilter['case_type_id.case_type_category']
        ? getCaseTypesFilteredByCategory($scope.caseFilter['case_type_id.case_type_category'])
        : caseTypes;

      $scope.caseTypes = filteredCaseTypes;
      $scope.caseTypesLength = _.size($scope.caseTypes);
    }

    /**
     * Returns case types filtered by given category.
     *
     * @param {string} categoryName the case type category name.
     * @returns {object[]} the filtered list of case types.
     */
    function getCaseTypesFilteredByCategory (categoryName) {
      var caseTypeCategory = _.find(caseTypeCategories, function (category) {
        return category.name.toLowerCase() === categoryName.toLowerCase();
      });

      if (!caseTypeCategory) {
        return [];
      }

      return _.pick(caseTypes, function (caseType) {
        return caseType.case_type_category === caseTypeCategory.value;
      });
    }

    /**
     * Stores in the browser cache the id values of the case statuses that have been
     * hidden.
     */
    function storeHiddenCaseStatuses () {
      var hiddenCaseStatusesIds = _.chain($scope.caseStatuses)
        .pick(function (caseStatus, key) {
          return caseStatus.isHidden;
        })
        .keys()
        .value();

      BrowserCache.set(BROWSER_CACHE_IDENTIFIER, hiddenCaseStatusesIds);
    }
  }
})(angular, CRM.$, CRM._);
