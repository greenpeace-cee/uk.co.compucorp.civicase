(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseEditCustomData', function () {
    return {
      restrict: 'A',
      link: civicaseEditCustomDataLinkFunction
    };
  });

  /**
   * Editable custom data blocks
   *
   * @param {object} scope the timeout wrapper
   * @param {document#element} elem the DOM element reference
   * @param {object} attrs the element attributes
   */
  function civicaseEditCustomDataLinkFunction (scope, elem, attrs) {
    var form;

    elem
      .addClass('crm-editable-enabled')
      .on('click', function (e) {
        if (!form) {
          var url = CRM.url('civicrm/case/cd/edit', {
            cgcount: 1,
            action: 'update',
            reset: 1,
            type: 'Case',
            entityID: scope.item.id,
            groupID: scope.customGroup.id,
            cid: scope.item.client[0].contact_id,
            subType: scope.item.case_type_id,
            civicase_reload: scope.caseGetParams()
          });
          form = $('<div></div>').html(elem.hide().html());
          form.insertAfter(elem)
            .on('click', '.cancel', close)
            .on('crmLoad', function () {
              // Workaround bug where href="#" changes the angular route
              $('a.crm-clear-link', form).removeAttr('href');
            })
            .on('crmFormSuccess', function (e, data) {
              scope.$apply(function () {
                scope.pushCaseData(data.civicase_reload[0]);
                close();
              });
            });
          CRM.loadForm(url, { target: form });
        }
      });

    /**
     * Cancels the editing of the custom fields by removing the form and showing the
     * the original element.
     */
    function close () {
      form.remove();
      elem.show();
      form = null;
    }
  }
})(angular, CRM.$, CRM._, CRM);
