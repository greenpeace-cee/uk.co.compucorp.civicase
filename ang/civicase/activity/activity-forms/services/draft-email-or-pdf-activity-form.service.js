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
      return getCrmUrl('civicrm/activity/email/add', {
        action: 'add',
        caseId: activity.case_id,
        context: 'standalone',
        draft_id: activity.id,
        reset: '1'
      });
    }
  }
})(CRM._, angular, CRM.url);
