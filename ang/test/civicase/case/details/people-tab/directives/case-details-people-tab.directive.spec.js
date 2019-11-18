/* eslint-env jasmine */

describe('Case Details People Tab', () => {
  let $controller, $rootScope, $scope, CasesData, ContactsData, crmConfirmDialog, originalCrmConfirm, originalSelect2;

  beforeEach(module('civicase', 'civicase.data'));

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _CasesData_, _ContactsData_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    CasesData = _CasesData_;
    ContactsData = _ContactsData_;

    $scope = $rootScope.$new();
    $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');
    $scope.refresh = jasmine.createSpy('refresh');

    originalCrmConfirm = CRM.confirm;
    originalSelect2 = CRM.$.fn.select2;
    CRM.$.fn.select2 = jasmine.createSpy('select2');
    crmConfirmDialog = CRM.$('<div class="mock-crm-confirm-dialog"></div>');
    CRM.confirm = function (options) {
      crmConfirmDialog.append(options.message);
      options.open();

      return crmConfirmDialog;
    };
  }));

  afterEach(() => {
    CRM.confirm = originalCrmConfirm;
    CRM.$.fn.select2 = originalSelect2;

    crmConfirmDialog.remove();
  });

  beforeEach(() => {
    $scope.item = CasesData.get().values[0];

    initController({
      $scope: $scope
    });
  });

  describe('assigning roles', () => {
    const roleName = 'Service Provider';
    const roleDescription = 'Service Provider Role Description';
    let contact, previousContact, relationshipTypeId;

    beforeEach(() => {
      contact = CRM._.sample(ContactsData.values);
      relationshipTypeId = CRM._.uniqueId();
    });

    describe('when assigning a new role', () => {
      beforeEach(() => {
        $scope.assignRoleOrClient({
          relationship_type_id: relationshipTypeId,
          role: roleName
        });
        setRoleContact(contact);
        setRoleDescription(roleDescription);
        crmConfirmDialog.trigger('crmConfirm:yes');
        $rootScope.$digest();
      });

      it('creates a new relationship between the case client and the selected contact using the given role', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Relationship', 'create', {
            relationship_type_id: relationshipTypeId,
            start_date: 'now',
            end_date: null,
            contact_id_b: contact.contact_id,
            case_id: $scope.item.id,
            description: roleDescription,
            contact_id_a: $scope.item.client[0].contact_id
          }]
        ]));
      });

      it('creates a new completed activity to record the contact being assigned a role to the case', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Activity', 'create', {
            case_id: $scope.item.id,
            target_contact_id: contact.contact_id,
            status_id: 'Completed',
            activity_type_id: 'Assign Case Role',
            subject: `${contact.display_name} added as ${roleName}`
          }]
        ]));
      });
    });

    describe('when replacing a role', () => {
      beforeEach(() => {
        previousContact = CRM._.sample(ContactsData.values);

        $scope.replaceRoleOrClient({
          contact_id: previousContact.contact_id,
          display_name: previousContact.display_name,
          relationship_type_id: relationshipTypeId,
          role: roleName
        });
        setRoleContact(contact);
        setRoleDescription(roleDescription);
        crmConfirmDialog.trigger('crmConfirm:yes');
        $rootScope.$digest();
      });

      it('marks the current role relationship as finished', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Relationship', 'get', {
            relationship_type_id: relationshipTypeId,
            contact_id_b: previousContact.contact_id,
            case_id: $scope.item.id,
            is_active: 1,
            'api.Relationship.create': {
              is_active: 0, end_date: 'now'
            }
          }]
        ]));
      });

      it('creates a new relationship between the case client and the selected contact using the given role', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Relationship', 'create', {
            relationship_type_id: relationshipTypeId,
            start_date: 'now',
            end_date: null,
            contact_id_b: contact.contact_id,
            case_id: $scope.item.id,
            description: roleDescription,
            contact_id_a: $scope.item.client[0].contact_id
          }]
        ]));
      });

      it('creates a new completed activity to record the case role has been reassigned', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Activity', 'create', {
            case_id: $scope.item.id,
            target_contact_id: jasmine.arrayContaining([
              previousContact.contact_id,
              contact.contact_id
            ]),
            status_id: 'Completed',
            activity_type_id: 'Assign Case Role',
            subject: `${contact.display_name} replaced ${previousContact.display_name} as ${roleName}`
          }]
        ]));
      });
    });

    describe('when adding a new case client', () => {
      beforeEach(() => {
        $scope.assignRoleOrClient({
          role: 'Client'
        });
        setRoleContact(contact);
        crmConfirmDialog.trigger('crmConfirm:yes');
        $rootScope.$digest();
      });

      it('creates a new client using the selected contact', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['CaseContact', 'create', {
            case_id: $scope.item.id,
            contact_id: contact.contact_id
          }]
        ]));
      });

      it('creates a new completed activity to record the contact being assigned as a client to the case', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Activity', 'create', {
            case_id: $scope.item.id,
            target_contact_id: contact.contact_id,
            status_id: 'Completed',
            activity_type_id: 'Add Client To Case',
            subject: `${contact.display_name} added as Client`
          }]
        ]));
      });
    });

    describe('when replacing the case client', () => {
      beforeEach(() => {
        previousContact = CRM._.sample(ContactsData.values);

        $scope.replaceRoleOrClient({
          contact_id: previousContact.contact_id,
          display_name: previousContact.display_name,
          role: 'Client'
        }, true);
        setRoleContact(contact);
        crmConfirmDialog.trigger('crmConfirm:yes');
        $rootScope.$digest();
      });

      it('removes the existing client from the case', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['CaseContact', 'get', {
            case_id: $scope.item.id,
            contact_id: previousContact.contact_id,
            'api.CaseContact.delete': {}
          }]
        ]));
      });

      it('creates a new client using the selected contact', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['CaseContact', 'create', {
            case_id: $scope.item.id,
            contact_id: contact.contact_id
          }]
        ]));
      });

      it('creates a new completed activity to record the case being reassigned to another client', () => {
        expect($scope.refresh).toHaveBeenCalledWith(jasmine.arrayContaining([
          ['Activity', 'create', {
            case_id: $scope.item.id,
            target_contact_id: jasmine.arrayContaining([
              previousContact.contact_id,
              contact.contact_id
            ]),
            status_id: 'Completed',
            activity_type_id: 'Reassigned Case',
            subject: `${contact.display_name} replaced ${previousContact.display_name} as Client`
          }]
        ]));
      });
    });
  });

  /**
   * Initializes the controller.
   *
   * @param {object} dependencies the list of dependencies to pass to the controller.
   */
  function initController (dependencies) {
    $controller('civicaseViewPeopleController', dependencies);
  }

  /**
   * Sets the given contact as the selected value of the case role selector dropdown.
   *
   * @param {object} contact a contact.
   */
  function setRoleContact (contact) {
    CRM.$('[name=caseRoleSelector]', crmConfirmDialog).val(contact.id);
    CRM.$.fn.select2.and.returnValue({
      id: contact.id,
      text: contact.display_name,
      extra: contact
    });
  }

  /**
   * Sets the description for the role being created using the confirm dialog.
   *
   * @param {string} description a drescription for the role.
   */
  function setRoleDescription (description) {
    CRM.$('[name=description]', crmConfirmDialog).val(description);
  }
});
