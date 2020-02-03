(function (angular, _) {
  var module = angular.module('civicase');

  module.service('CasesUtils', function (ContactsCache) {
    /**
     * Fetch additional information about the contacts
     *
     * @param {Array} cases array to be fetched from
     */
    this.fetchMoreContactsInformation = function (cases) {
      var contacts = [];

      _.each(cases, function (caseObj) {
        contacts = contacts.concat(getAllContactIdsForCase(caseObj));
      });

      ContactsCache.add(contacts);
    };

    /**
     * Process all case clients contacts ids.
     *
     * @param {Array} contacts of a case.
     * @returns {Array} of all client ids.
     */
    this.getAllCaseClientContactIdsFromAllContacts = function (contacts) {
      return _.chain(contacts)
        .filter(function (contact) {
          return contact.role === 'Client';
        })
        .map(function (client) {
          return client.contact_id;
        })
        .value();
    };

    /**
     * Get all the contacts of the given case
     *
     * @param {object} caseObj - case object to be processed
     *
     * @returns {Array} of all contact ids
     */
    function getAllContactIdsForCase (caseObj) {
      var contacts = [];

      _.each(caseObj.contacts, function (currentCase) {
        contacts.push(currentCase.contact_id);
      });
      _.each(caseObj.allActivities, function (activity) {
        contacts = contacts.concat(activity.assignee_contact_id);
        contacts = contacts.concat(activity.target_contact_id);
        contacts.push(activity.source_contact_id);
      });

      return contacts;
    }
  });
})(angular, CRM._);
