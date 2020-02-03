/* eslint-env jasmine */
((_, getCrmUrl) => {
  describe('DraftEmailOrPdfActivityForm', () => {
    let activity, activityFormUrl, checkIfDraftEmailOrPDFActivity,
      DraftEmailOrPdfActivityForm, CasesUtils, expectedActivityFormUrl;

    beforeEach(module('civicase', 'civicase-base', 'civicase.data'));

    beforeEach(inject((_activitiesMockData_, _checkIfDraftEmailOrPDFActivity_,
      _DraftEmailOrPdfActivityForm_, _CasesUtils_) => {
      checkIfDraftEmailOrPDFActivity = _checkIfDraftEmailOrPDFActivity_;
      DraftEmailOrPdfActivityForm = _DraftEmailOrPdfActivityForm_;
      CasesUtils = _CasesUtils_;
      activity = _.chain(_activitiesMockData_.get())
        .first()
        .cloneDeep()
        .value();
    }));

    describe('handling activity forms', () => {
      it('uses the check if draft email or pdf activity service to determine if it can handle the activity', () => {
        expect(DraftEmailOrPdfActivityForm.canHandleActivity)
          .toBe(checkIfDraftEmailOrPDFActivity);
      });
    });

    describe('when getting the form url', () => {
      beforeEach(() => {
        activityFormUrl = DraftEmailOrPdfActivityForm.getActivityFormUrl(activity);
        expectedActivityFormUrl = getCrmUrl('civicrm/activity/email/add', {
          action: 'add',
          caseId: activity.case_id,
          cid: CasesUtils.getAllCaseClientContactIdsFromAllContacts(activity['case_id.contacts']).join(','),
          draft_id: activity.id,
          reset: '1'
        });
      });

      it('returns the popup form url for the draft activity', () => {
        expect(activityFormUrl).toEqual(expectedActivityFormUrl);
      });
    });
  });
})(CRM._, CRM.url);
