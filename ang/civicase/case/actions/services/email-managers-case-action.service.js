(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('EmailManagersCaseAction', EmailManagersCaseAction);

  /**
   *
   */
  function EmailManagersCaseAction () {
    /**
     * Click event handler for the Action
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

      if (managers.length > 0) {
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
      } else {
        CRM.alert('Please add a contact as a case manager', 'No case managers available', 'error');
      }
    };
  }
})(angular, CRM.$, CRM._);
