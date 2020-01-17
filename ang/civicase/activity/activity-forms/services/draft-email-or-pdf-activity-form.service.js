(function (_, angular, getCrmUrl) {
  var module = angular.module('civicase');

  module.service('DraftEmailOrPdfActivityForm', DraftEmailOrPdfActivityForm);

  /**
   * Draft email or PDF activity form service.
   *
   * @param {Function} checkIfDraftEmailOrPDFActivity the check if draft email or pdf activity function.
   */
  function DraftEmailOrPdfActivityForm (checkIfDraftEmailOrPDFActivity) {
    this.canHandleActivity = checkIfDraftEmailOrPDFActivity;
    this.getActivityFormUrl = getActivityFormUrl;

    /**
     * @param {object} activity an activity object.
     * @returns {string} the form URL for activities that are either email drafts or PDF drafts.
     */
    function getActivityFormUrl (activity) {
      var caseClientsIds = getCaseClientsIds(activity).join(',');

      return getCrmUrl('civicrm/activity/email/add', {
        action: 'add',
        caseId: activity.case_id,
        cid: caseClientsIds,
        draft_id: activity.id,
        reset: '1'
      });
    }

    /**
     * @param {object} activity an activity object.
     * @returns {Array} of all client ids.
     */
    function getCaseClientsIds (activity) {
      return _.chain(activity['case_id.contacts'])
        .filter(function (contact) {
          return contact.role === 'Client';
        })
        .map(function (client) {
          return client.contact_id;
        })
        .value();
    }
  }
})(CRM._, angular, CRM.url);
