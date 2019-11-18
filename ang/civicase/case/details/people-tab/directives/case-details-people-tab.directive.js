(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseDetailsPeopleTab', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/case/details/people-tab/directives/case-details-people-tab.directive.html',
      controller: civicaseViewPeopleController,
      scope: {
        item: '=civicaseCaseDetailsPeopleTab',
        refresh: '=refreshCallback'
      }
    };
  });

  module.controller('civicaseViewPeopleController', civicaseViewPeopleController);

  /**
   * @typedef {{
   *   contact_id: number,
   *   contact_sub_type: string,
   *   contact_type: string,
   *   display_name: string,
   *   relationship_type_id: number,
   *   role: string,
   * }} Role
   * @typedef {{
   *  contact: {
   *    id: number,
   *    extra: {
   *      display_name: string
   *    }
   *  },
   *  description: string,
   *  role: Role
   * }} contactPromptResult
   */

  /**
   * ViewPeople Controller
   *
   * @param {object} $q $q
   * @param {object} $scope $scope
   * @param {object} allowMultipleCaseClients allow multiple clients configuration value
   * @param {object} crmApi crmApi
   * @param {object} DateHelper DateHelper
   * @param {object} ts ts
   * @param {object} RelationshipType RelationshipType
   */
  function civicaseViewPeopleController ($q, $scope, allowMultipleCaseClients, crmApi, DateHelper,
    ts, RelationshipType) {
    // The ts() and hs() functions help load strings for this module.
    var clients = _.indexBy($scope.item.client, 'contact_id');
    var item = $scope.item;
    var relTypes = RelationshipType.getAll();
    var relTypesByName = _.indexBy(relTypes, 'name_b_a');
    $scope.ts = ts;

    $scope.allowMultipleCaseClients = allowMultipleCaseClients;
    $scope.roles = [];
    $scope.rolesFilter = '';
    $scope.rolesPage = 1;
    $scope.rolesAlphaFilter = '';
    $scope.rolesSelectionMode = '';
    $scope.rolesSelectedTask = '';
    $scope.relations = [];
    $scope.relationsPage = 1;
    $scope.relationsAlphaFilter = '';
    $scope.relationsSelectionMode = '';
    $scope.relationsSelectedTask = '';
    $scope.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    $scope.contactTasks = CRM.civicase.contactTasks;
    $scope.ceil = Math.ceil;
    $scope.allRoles = [];
    $scope.isRolesLoading = true;
    $scope.isRelationshipLoading = true;

    $scope.formatDate = DateHelper.formatDate;
    $scope.getRelations = getRelations;

    (function init () {
      $scope.$bindToRoute({ expr: 'tab', param: 'peopleTab', format: 'raw', default: 'roles' });
      $scope.$watch('item', getCaseRoles, true);
      $scope.$watch('item.definition', function () {
        if ($scope.item && $scope.item.definition && $scope.item.definition.caseRoles) {
          $scope.allRoles = _.each(_.cloneDeep($scope.item.definition.caseRoles), formatRole);
        }
      });
      $scope.$watch('rolesFilter', getCaseRoles);
      $scope.$watch('tab', function (tab) {
        if (tab === 'relations' && !$scope.relations.length) {
          getRelations();
        }
      });
    }());

    /**
     * Get selected contacts from the selection bar
     *
     * @param {string} tab tab
     * @param {boolean} onlyChecked onlyChecked
     * @returns {Array} selected contact
     */
    $scope.getSelectedContacts = function (tab, onlyChecked) {
      var idField = (tab === 'roles' ? 'contact_id' : 'id');
      if (onlyChecked || $scope[tab + 'SelectionMode'] === 'checked') {
        return _.collect(_.filter($scope[tab], { checked: true }), idField);
      } else if ($scope[tab + 'SelectionMode'] === 'all') {
        return _.collect(_.filter($scope[tab], function (el) {
          return el.contact_id;
        }), idField);
      }
      return [];
    };

    /**
     * On the contact tab all the records don't have some contact assigned
     * This filters the list with roles assigned to a contact.
     *
     * @param {Array} roles roles
     * @returns {number} count of roles
     */
    $scope.getCountOfRolesWithContacts = function (roles) {
      return _.filter(roles, function (role) {
        return role.contact_id;
      }).length;
    };

    /**
     * Sets selection mode
     *
     * @param {string} mode mode
     * @param {string} tab tab
     */
    $scope.setSelectionMode = function (mode, tab) {
      $scope[tab + 'SelectionMode'] = mode;
    };

    /**
     * Sets selected tab
     *
     * @param {string} tab tab
     */
    $scope.setTab = function (tab) {
      $scope.tab = tab;
    };

    /**
     * Filters result on the basis of letter clicked
     *
     * @param {string} letter letter
     * @param {string} tab tab
     */
    $scope.setLetterFilter = function (letter, tab) {
      if ($scope[tab + 'AlphaFilter'] === letter) {
        $scope[tab + 'AlphaFilter'] = '';
      } else {
        $scope[tab + 'AlphaFilter'] = letter;
      }

      if (tab === 'roles') {
        getCaseRoles();
      } else {
        $scope.getRelations();
      }
    };

    /**
     * Update the contacts with the task
     *
     * @param {string} tab tab
     */
    $scope.doContactTask = function (tab) {
      var task = $scope.contactTasks[$scope[tab + 'SelectedTask']];
      $scope[tab + 'SelectedTask'] = '';
      CRM.loadForm(CRM.url(task.url, { cids: $scope.getSelectedContacts(tab).join(',') }))
        .on('crmFormSuccess', $scope.refresh)
        .on('crmFormSuccess', function () {
          $scope.refresh();
          if (tab === 'relations') {
            $scope.getRelations();
          }
        });
    };

    /**
     * Prompts the user to create either a new role or client related to the case.
     *
     * @param {Role} role the role to assign to the case.
     */
    $scope.assignRoleOrClient = function (role) {
      var isAssigningRole = role && !!role.relationship_type_id;

      if (isAssigningRole) {
        assignRole(role);
      } else {
        assignClient();
      }
    };

    /**
     * Replaces the given role or client with another one selected by the user.
     *
     * @param {Role} role the role to replace.
     */
    $scope.replaceRoleOrClient = function (role) {
      var isReplacingClient = !role.relationship_type_id;
      var activityTypeId = isReplacingClient
        ? 'Reassigned Case'
        : 'Assign Case Role';

      promptForContact({
        title: ts('Replace %1', { 1: role.role }),
        showDescriptionField: !isReplacingClient,
        role: role
      })
        .then(function (contactPromptResult) {
          var activitySubject = ts('%1 replaced %2 as %3', {
            1: contactPromptResult.contact.extra.display_name,
            2: role.display_name,
            3: role.role
          });
          var apiCalls = [
            unassignRoleCall(role),
            getCreateRoleActivityApiCall({
              activity_type_id: activityTypeId,
              subject: activitySubject,
              target_contact_id: [
                contactPromptResult.contact.id,
                role.contact_id
              ]
            })
          ];

          if (isReplacingClient) {
            apiCalls.push(['CaseContact', 'create', {
              case_id: item.id,
              contact_id: contactPromptResult.contact.id
            }]);
          } else {
            apiCalls = apiCalls.concat(
              getCreateCaseRoleApiCalls(contactPromptResult)
            );
          }

          $scope.refresh(apiCalls);
        });
    };

    /**
     * Unassign the role to a contact
     *
     * @param {string} role role
     */
    $scope.unassignRole = function (role) {
      CRM.confirm({
        title: ts('Remove %1', { 1: role.role }),
        message: ts('Remove %1 as %2?', { 1: role.display_name, 2: role.role })
      }).on('crmConfirm:yes', function () {
        var apiCalls = [unassignRoleCall(role)];
        apiCalls.push(['Activity', 'create', {
          case_id: item.id,
          target_contact_id: role.contact_id,
          status_id: 'Completed',
          activity_type_id: role.relationship_type_id ? 'Remove Case Role' : 'Remove Client From Case',
          subject: ts('%1 removed as %2', { 1: role.display_name, 2: role.role })
        }]);
        $scope.refresh(apiCalls);
      });
    };

    /**
     * Returns the parameters needed to create a completed activity related to the case.
     *
     * @param {object} extraParams extra parameters to pass to the activity creation call.
     * @returns {[string, string, object]} the create activity api call params.
     */
    function getCreateRoleActivityApiCall (extraParams) {
      return ['Activity', 'create', _.extend({}, {
        case_id: item.id,
        status_id: 'Completed'
      }, extraParams)];
    }

    /**
     * Returns all the calls needed to create relationships between the selected contact and all the
     * clients related to the case.
     *
     * @param {contactPromptResult} contactPromptResult the contact returned by the confirm dialog
     * @returns {Array[]} a list of api calls.
     */
    function getCreateCaseRoleApiCalls (contactPromptResult) {
      var params = {
        relationship_type_id: contactPromptResult.role.relationship_type_id,
        start_date: 'now',
        end_date: null,
        contact_id_b: contactPromptResult.contact.id,
        case_id: item.id,
        description: contactPromptResult.description
      };

      return _.map(item.client, function (client) {
        params.contact_id_a = client.contact_id;

        return ['Relationship', 'create', params];
      });
    }

    /**
     * Promps for a client contact and assigns it to the case. This event is also recorded as an activity related
     * to the case.
     */
    function assignClient () {
      var role = { role: ts('Client') };

      promptForContact({
        title: ts('Add Client'),
        showDescriptionField: false,
        role: role
      })
        .then(function (contactPromptResult) {
          var activitySubject = ts('%1 added as Client', {
            1: contactPromptResult.contact.extra.display_name
          });
          var apiCalls = [
            getCreateRoleActivityApiCall({
              activity_type_id: 'Add Client To Case',
              subject: activitySubject,
              target_contact_id: contactPromptResult.contact.id
            }),
            ['CaseContact', 'create', {
              case_id: item.id,
              contact_id: contactPromptResult.contact.id
            }]
          ];

          $scope.refresh(apiCalls);
        });
    }

    /**
     * Prompts the user to select a contact to assign them to the case. Relationships between
     * the selected contact and the case clients are created using the provided role. This event is also
     * recorded as an activity related to the case.
     *
     * @param {Role} role the role details.
     */
    function assignRole (role) {
      promptForContact({
        title: ts('Add %1', { 1: role.role }),
        showDescriptionField: true,
        role: role
      })
        .then(function (contactPromptResult) {
          var activitySubject = ts('%1 added as %2', {
            1: contactPromptResult.contact.extra.display_name,
            2: role.role
          });
          var apiCalls = [
            getCreateRoleActivityApiCall({
              activity_type_id: 'Assign Case Role',
              subject: activitySubject,
              target_contact_id: contactPromptResult.contact.id
            })
          ].concat(
            getCreateCaseRoleApiCalls(contactPromptResult)
          );

          $scope.refresh(apiCalls);
        });
    }

    /**
     * Displays a confirmation dialog used to select a contact. An optional description input can also be
     * included in the confirmation dialog.
     *
     * @typedef {{
     *   showDescriptionField: boolean,
     *   role: Role,
     *   title: string
     * }} ContactPromptOptions
     * @param {ContactPromptOptions} options the prompt options
     * @returns {Promise} a promise that is resolved when the dialog is confirmed.
     */
    function promptForContact (options) {
      var deferred = $q.defer();
      options = _.assign({ roles: {} }, options);

      var modalBody = '<input name="caseRoleSelector" placeholder="' + ts('Select Contact') + '" />';

      if (options.showDescriptionField) {
        modalBody += '<br/><textarea rows="3" cols="35" name="description" class="crm-form-textarea" style="margin-top: 10px;padding-left: 10px;border-color: #C2CFDE;color: #9494A4;" placeholder="Description"></textarea>';
      }

      CRM.confirm({
        title: options.title,
        message: modalBody,
        open: function () {
          $('[name=caseRoleSelector]', this).crmEntityRef({
            create: true,
            api: {
              extra: ['display_name'],
              params: {
                contact_type: options.role.contact_type,
                contact_sub_type: options.role.contact_sub_type
              }
            }
          });
        }
      })
        .on('crmConfirm:yes', function () {
          var contact = $('[name=caseRoleSelector]', this).select2('data');
          var description = $('[name=description]', this).val();

          deferred.resolve({
            contact: contact,
            description: description,
            role: options.role
          });
        })
        .on('crmConfirm:no', function () {
          deferred.reject('cancelled');
        });

      return deferred.promise;
    }

    /**
     * Unassign role
     *
     * @param {object} role role
     * @returns {Array} API call
     */
    function unassignRoleCall (role) {
      // Case Role
      if (role.relationship_type_id) {
        return ['Relationship', 'get', {
          relationship_type_id: role.relationship_type_id,
          contact_id_b: role.contact_id,
          case_id: item.id,
          is_active: 1,
          'api.Relationship.create': { is_active: 0, end_date: 'now' }
        }];
      } else { // Case Client
        return ['CaseContact', 'get', {
          case_id: item.id,
          contact_id: role.contact_id,
          'api.CaseContact.delete': {}
        }];
      }
    }

    /**
     * Formats the role in required format
     *
     * @param {object} role role
     */
    function formatRole (role) {
      var relType = relTypesByName[role.name];
      role.role = relType.label_b_a;
      role.contact_type = relType.contact_type_b;
      role.contact_sub_type = relType.contact_sub_type_b;
      role.description = (role.manager === '1' ? (ts('Case Manager.') + ' ') : '') + (relType.description || '');
      role.relationship_type_id = relType.id;
    }

    if ($scope.item && $scope.item.definition && $scope.item.definition.caseRoles) {
      $scope.allRoles = _.each(_.cloneDeep($scope.item.definition.caseRoles), formatRole);
    }
    /**
     * Updates the case roles list
     */
    function getCaseRoles () {
      var caseRoles, selected;
      var relDesc = [];
      var allRoles = [];
      if ($scope.item && $scope.item.definition && $scope.item.definition.caseRoles) {
        allRoles = _.each(_.cloneDeep($scope.item.definition.caseRoles), formatRole);
        // Case Roles loading completes after all Roles are fetched
        $scope.isRolesLoading = false;
      }
      caseRoles = $scope.rolesAlphaFilter ? [] : _.cloneDeep(allRoles);
      selected = $scope.getSelectedContacts('roles', true);
      if ($scope.rolesFilter) {
        caseRoles = $scope.rolesFilter === 'client' ? [] : [_.findWhere(caseRoles, { name: $scope.rolesFilter })];
      }

      // get relationship descriptions
      if (item['api.Relationship.get']) {
        _.each(item['api.Relationship.get'].values, function (relationship) {
          relDesc[relationship.contact_id_b + '_' + relationship.relationship_type_id] = relationship.description ? relationship.description : '';
          relDesc[relationship.contact_id_b + '_' + relationship.relationship_type_id + '_date'] = relationship.start_date;
        });
      }
      // get clients from the contacts
      _.each(item.contacts, function (contact) {
        var role = contact.relationship_type_id ? _.findWhere(caseRoles, { relationship_type_id: contact.relationship_type_id }) : null;
        if ((!role || role.contact_id) && contact.relationship_type_id) {
          role = _.cloneDeep(_.findWhere(allRoles, { relationship_type_id: contact.relationship_type_id }));
          if (!$scope.rolesFilter || role.name === $scope.rolesFilter) {
            caseRoles.push(role);
          }
        }
        // Apply filters
        if ($scope.rolesAlphaFilter && contact.display_name.toUpperCase().indexOf($scope.rolesAlphaFilter) < 0) {
          if (role) _.pull(caseRoles, role);
        } else if (role) {
          if (!$scope.rolesFilter || role.name === $scope.rolesFilter) {
            $.extend(role, { checked: selected.indexOf(contact.contact_id) >= 0 }, contact);
          }
        } else if (!$scope.rolesFilter || $scope.rolesFilter === 'client') {
          caseRoles.push($.extend({ role: ts('Client'), checked: selected.indexOf(contact.contact_id) >= 0 }, contact));
        }
      });

      // Set description and start date for no clients case roles
      _.each(caseRoles, function (role, index) {
        if (role && role.role !== 'Client' && (role.contact_id + '_' + role.relationship_type_id in relDesc)) {
          caseRoles[index].desc = relDesc[role.contact_id + '_' + role.relationship_type_id];
          caseRoles[index].start_date = relDesc[role.contact_id + '_' + role.relationship_type_id + '_date'];
        }
      });
      $scope.rolesCount = caseRoles.length;
      // Apply pager
      if ($scope.rolesCount <= (25 * ($scope.rolesPage - 1))) {
        // Reset if out of range
        $scope.rolesPage = 1;
      }
      $scope.roles = _.slice(caseRoles, (25 * ($scope.rolesPage - 1)), 25 * $scope.rolesPage);
    }

    /**
     * Updates the case relationship list
     */
    function getRelations () {
      var params = {
        options: { limit: 25, offset: $scope.relationsPage - 1 },
        case_id: item.id,
        sequential: 1,
        return: ['display_name', 'phone', 'email']
      };
      if ($scope.relationsAlphaFilter) {
        params.display_name = $scope.relationsAlphaFilter;
      }
      crmApi('Case', 'getrelations', params).then(function (contacts) {
        $scope.relations = _.each(contacts.values, function (rel) {
          var relType = relTypes[rel.relationship_type_id];
          rel.relation = relType['label_' + rel.relationship_direction];
          rel.client = clients[rel.client_contact_id].display_name;
        });
        $scope.relationsCount = contacts.count;
        $scope.isRelationshipLoading = false;
      });
    }
  }
})(angular, CRM.$, CRM._);
