(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseSearch', function () {
    return {
      replace: true,
      templateUrl: '~/civicase/case/search/directives/search.directive.html',
      controller: 'civicaseSearchController',
      scope: {
        defaults: '=filters',
        hiddenFilters: '=',
        onSearch: '@',
        expanded: '='
      }
    };
  });

  /**
   * Controller Function for civicase-search directive
   */
  module.controller('civicaseSearchController', function ($scope, $rootScope, $timeout,
    crmApi, getSelect2Value, ts) {
    // The ts() functions help load strings for this module.
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;
    var caseTypeCategories = CRM.civicase.caseTypeCategories;
    var allSearchFields = {
      id: { label: ts('Case ID'), html_type: 'Number' },
      has_role: { label: ts('Contact Search') },
      case_manager: { label: ts('Case Manager') },
      start_date: { label: ts('Start Date') },
      end_date: { label: ts('End Date') },
      is_deleted: { label: ts('Deleted Cases') },
      tag_id: { label: ts('Tags') }
    };
    var caseRelationshipConfig = [
      { 'text': ts('All Cases'), 'id': 'all' },
      { 'text': ts('My cases'), 'id': 'is_case_manager' },
      { 'text': ts('Cases I am involved'), 'id': 'is_involved' }
    ];

    $scope.pageTitle = '';
    $scope.caseStatusOptions = _.map(caseStatuses, mapSelectOptions);
    $scope.customGroups = CRM.civicase.customSearchFields;
    $scope.caseRelationshipOptions = caseRelationshipConfig;
    $scope.checkPerm = CRM.checkPerm;
    $scope.filterDescription = buildDescription();
    $scope.filters = angular.extend({}, $scope.defaults);
    $scope.ts = ts;
    $scope.contactRoles = [
      { id: 'all-case-roles', text: ts('All Case Roles') },
      { id: 'client', text: ts('Client') }
    ];
    $scope.contactRoleFilter = {
      selectedContacts: null,
      selectedContactRoles: [ 'all-case-roles' ]
    };

    (function init () {
      bindRouteParamsToScope();
      setCaseTypesBasedOnCategory();
      initiateWatchers();
      initSubscribers();
      setCustomSearchFieldsAsSearchFilters();
      requestCaseRoles().then(addCaseRolesToContactRoles);
    }());

    /**
     * Check/Uncheck `Show deleted` filters
     *
     * @param {object} $event - event object of Event API
     */
    $scope.toggleIsDeleted = function ($event) {
      var pressedSpaceOrEnter = $event.type === 'keydown' && ($event.keyCode === 32 || $event.keyCode === 13);

      if ($event.type === 'click' || pressedSpaceOrEnter) {
        $scope.filters.is_deleted = !$scope.filters.is_deleted;
        $event.preventDefault();
      }
    };

    /**
     * Show filter only when not hidden
     * This is configured from the backend
     *
     * @param {string} field - key of the field to be checked for
     * @return {Boolean} - boolean value if the filter is enabled
     */
    $scope.isEnabled = function (field) {
      return !$scope.hiddenFilters || !$scope.hiddenFilters[field];
    };

    /**
     * Checks if the current logged in user is a case manager
     */
    $scope.caseManagerIsMe = function () {
      return $scope.filters.case_manager && $scope.filters.case_manager.length === 1 && parseInt($scope.filters.case_manager[0], 10) === CRM.config.user_contact_id;
    };

    /**
     * Setup filter params and call search API
     * to feed results for cases
     */
    $scope.doSearch = function () {
      $scope.filterDescription = buildDescription();
      $scope.expanded = false;
      $rootScope.$broadcast('civicase::case-search::filters-updated', {
        selectedFilters: formatSearchFilters($scope.filters)
      });
    };

    /**
     * Resets filter options and reload search items
     */
    $scope.clearSearch = function () {
      $scope.contactRoleFilter = {
        selectedContacts: null,
        selectedContactRoles: [ 'all-case-roles' ]
      };
      $scope.filters = {};
      $scope.doSearch();
    };

    /**
     * Adds the given case roles to the list of contact roles.
     *
     * @param {Array} caseRoles a list of relationship types as returned by the API.
     */
    function addCaseRolesToContactRoles (caseRoles) {
      _.chain(caseRoles)
        .sortBy('label_b_a')
        .forEach(function (caseRole) {
          $scope.contactRoles.push({
            id: caseRole.id,
            text: caseRole.label_b_a
          });
        })
        .value();
    }

    /**
     * Binds all route parameters to scope
     */
    function bindRouteParamsToScope () {
      $scope.$bindToRoute({expr: 'expanded', param: 'sx', format: 'bool', default: false});
      $scope.$bindToRoute({expr: 'filters', param: 'cf', default: {}});
      $scope.$bindToRoute({expr: 'contactRoleFilter', param: 'crf', default: $scope.contactRoleFilter});
    }

    /**
     * Builds human readable filter description to be shown on the UI
     *
     * @return {Array} des - Arrayed output to be shown as the fitler description with human readable key value pair
     */
    function buildDescription () {
      var des = [];
      _.each($scope.filters, function (val, key) {
        var field = allSearchFields[key];
        if (field) {
          var d = {label: field.label};
          if (field.options) {
            var text = [];
            _.each(val, function (o) {
              text.push(_.findWhere(field.options, {key: o}).value);
            });
            d.text = text.join(', ');
          } else if (key === 'case_manager' && $scope.caseManagerIsMe()) {
            d.text = ts('Me');
          } else if (key === 'has_role') {
            d.text = ts('%1 selected', {'1': val.contact.IN.length});
          } else if ($.isArray(val)) {
            d.text = ts('%1 selected', {'1': val.length});
          } else if ($.isPlainObject(val)) {
            if (val.BETWEEN) {
              d.text = val.BETWEEN[0] + ' - ' + val.BETWEEN[1];
            } else if (val['<=']) {
              d.text = '≤ ' + val['<='];
            } else if (val['>=']) {
              d.text = '≥ ' + val['>='];
            } else {
              var k = _.findKey(val, function () { return true; });
              d.text = k + ' ' + val[k];
            }
          } else if (typeof val === 'boolean') {
            d.text = val ? ts('Yes') : ts('No');
          } else {
            d.text = val;
          }
          des.push(d);
        }
      });
      return des;
    }

    /**
     * Watches changes to the case role filters, prepares the params to be sent
     * to the API and appends them to the filters object.
     */
    function caseRoleWatcher () {
      var filters = $scope.filters;
      var selectedContacts = getSelect2Value($scope.contactRoleFilter.selectedContacts);
      var selectedContactRoles = getSelect2Value($scope.contactRoleFilter.selectedContactRoles);
      var hasAllCaseRolesSelected = selectedContactRoles.indexOf('all-case-roles') >= 0;
      var hasClientSelected = selectedContactRoles.indexOf('client') >= 0;
      var caseRoleIds = _.filter(selectedContactRoles, function (roleId) {
        return parseInt(roleId, 10);
      });

      if (!selectedContacts || !selectedContacts.length) {
        delete filters.has_role;

        return;
      }

      filters.has_role = {
        contact: { IN: selectedContacts },
        can_be_client: true,
        all_case_roles_selected: hasAllCaseRolesSelected
      };

      delete filters.contact_id;

      if (!hasAllCaseRolesSelected) {
        if (caseRoleIds.length) {
          filters.has_role.role_type = { IN: caseRoleIds };
        }

        if (!hasClientSelected) {
          filters.has_role.can_be_client = false;
        }
      }
    }

    /**
     * Watcher for expanded state and update tableHeader top offset likewise
     */
    function expandedWatcher () {
      $rootScope.$broadcast('civicase::case-search::dropdown-toggle');
    }

    /**
     * Formats search filter as per the API request header format
     *
     * @params {object} inp - Object for input option to be formatted
     * @return (object} search - returns formatted key value pair of filters
     */
    function formatSearchFilters (inp) {
      var search = {};
      _.each(inp, function (val, key) {
        if (!_.isEmpty(val) || ((typeof val === 'number') && val) || ((typeof val === 'boolean') && val)) {
          search[key] = val;
        }
      });
      return search;
    }

    /**
     * Watcher for filter collection to update the search
     * Only works when dropdown is unexpanded
     */
    function filtersWatcher () {
      setCaseTypesBasedOnCategory();

      if (!$scope.expanded) {
        $scope.doSearch();
      }
    }

    /**
     * Returns case types filtered by given category
     *
     * @param {String} categoryName
     * @return {Array}
     */
    function getCaseTypesFilteredByCategory (categoryName) {
      var caseTypeCategory = _.find(caseTypeCategories, function (category) {
        return category.name.toLowerCase() === categoryName.toLowerCase();
      });

      if (!caseTypeCategory) {
        return [];
      }

      return _.filter(caseTypes, function (caseType) {
        return caseType.case_type_category === caseTypeCategory.value;
      });
    }

    /**
     * All subscribers are initiated here
     */
    function initSubscribers () {
      $rootScope.$on('civicase::case-search::page-title-updated', setPageTitle);
    }

    /**
     * All watchers are initiated here
     */
    function initiateWatchers () {
      $scope.$watch('expanded', expandedWatcher);
      $scope.$watch('relationshipType', relationshipTypeWatcher);
      $scope.$watch('caseTypeCategory', setCaseTypesBasedOnCategory);
      $scope.$watchCollection('filters', filtersWatcher);
      $scope.$watchCollection('contactRoleFilter', caseRoleWatcher);
    }

    /**
     * Map the option parameter from API
     * to show up correctly on the UI.
     *
     * @param {object} opt object for caseTypes
     * @return {object} mapped value to be used in UI
     */
    function mapSelectOptions (opt) {
      return {
        id: opt.value || opt.name,
        text: opt.label || opt.title,
        color: opt.color,
        icon: opt.icon
      };
    }

    /**
     * Watcher for relationshipType filter
     */
    function relationshipTypeWatcher () {
      if ($scope.relationshipType) {
        $scope.relationshipType[0] === 'is_case_manager' ? $scope.filters.case_manager = [CRM.config.user_contact_id] : delete ($scope.filters.case_manager);
        $scope.relationshipType[0] === 'is_involved' ? $scope.filters.contact_involved = [CRM.config.user_contact_id] : delete ($scope.filters.contact_involved);
      }
    }

    /**
     * Requests the list of relationship types that have been assigned to case types.
     *
     * @return {Promise} resolves to a list of relationship types.
     */
    function requestCaseRoles () {
      return crmApi('RelationshipType', 'getcaseroles', {
        options: { limit: 0 }
      })
        .then(function (caseRolesResponse) {
          return caseRolesResponse.values;
        });
    }

    /**
     * Sets the Case Types Based on Case Type Category
     */
    function setCaseTypesBasedOnCategory () {
      var filteredCaseTypes = $scope.filters.case_type_category
        ? getCaseTypesFilteredByCategory($scope.filters.case_type_category)
        : caseTypes;

      $scope.caseTypeOptions = _.map(filteredCaseTypes, mapSelectOptions);
    }

    /**
     * Set custom search fields to search filter fields object
     */
    function setCustomSearchFieldsAsSearchFilters () {
      _.each(CRM.civicase.customSearchFields, function (group) {
        _.each(group.fields, function (field) {
          allSearchFields['custom_' + field.id] = field;
        });
      });
    }

    /**
     * Set the title of the page
     *
     * @params {Object} event
     * @params {String} displayNameOfSelectedItem
     * @params {String} totalCount
     */
    function setPageTitle (event, displayNameOfSelectedItem, totalCount) {
      var filters = $scope.filters;

      if (displayNameOfSelectedItem) {
        $scope.pageTitle = displayNameOfSelectedItem;
        return;
      }

      if (_.size(_.omit(filters, ['status_id', 'case_type_id']))) {
        $scope.pageTitle = $scope.ts('Case Search Results');
      } else {
        var status = [];
        if (filters.status_id && filters.status_id.length) {
          _.each(filters.status_id, function (s) {
            status.push(_.findWhere(caseStatuses, {name: s}).label);
          });
        } else {
          status = [$scope.ts('All Open')];
        }
        var type = [];
        if (filters.case_type_id && filters.case_type_id.length) {
          _.each(filters.case_type_id, function (t) {
            type.push(_.findWhere(caseTypes, {name: t}).title);
          });
        }
        $scope.pageTitle = status.join(' & ') + ' ' + type.join(' & ') + ' ' + $scope.ts('Cases');
      }
      if (typeof totalCount === 'number') {
        $scope.pageTitle += ' (' + totalCount + ')';
      }
    }
  });
})(angular, CRM.$, CRM._);
