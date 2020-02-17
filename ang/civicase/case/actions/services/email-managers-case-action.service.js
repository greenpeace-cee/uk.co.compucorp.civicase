(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('EmailManagersCaseAction', EmailManagersCaseAction);

  /**
   * EmailManagersCaseAction service callback function.
   */
  function EmailManagersCaseAction () {
    /**
     * Returns the configuration options to open up a mail popup to
     * communicate with the case managers. Displays an error message
     * when no case managers have been assigned to the case.
     *
     * @param {Array} cases
     * @param {object} action
     * @param {Function} callbackFn
     */
    this.doAction = function (cases, action, callbackFn) {
      var managers = [];

      _.each(cases, function (item) {
        if (item.manager) {
          managers.push(item.manager.contact_id);
        }
      });

      if (managers.length === 0) {
        CRM.alert('Please add a contact as a case manager', 'No case managers available', 'error');

        return;
      }

      var popupPath = {
        path: 'civicrm/activity/email/add',
        query: {
          action: 'add',
          reset: 1,
          cid: _.uniq(managers).join(',')
        }
      };

      if (cases.length === 1) {
        popupPath.query.caseid = cases[0].id;
      }

      return popupPath;
    };
  }
})(angular, CRM.$, CRM._);
