(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseEditCustomData', function ($timeout) {
    return {
      restrict: 'A',
      link: civicaseEditCustomDataLinkFunction
    };

    /**
     * Editable custom data blocks
     *
     * @param {object} scope the timeout wrapper
     * @param {document#element} elem the DOM element reference
     * @param {object} attrs the element attributes
     */
    function civicaseEditCustomDataLinkFunction (scope, elem, attrs) {
      var form;
      var jQueryFocusMethod = $.fn.focus;
      var noopFocusMethod = function () { return this; };

      (function init () {
        elem
          .addClass('crm-editable-enabled')
          .on('click', loadCustomFieldEditForm);
      })();

      /**
       * Blocks jQuery's focus method by providing a noop function. This is done in order
       * to avoid core's loadForm method from focusing on calendar inputs.
       */
      function blockFocusMethod () {
        $.fn.focus = noopFocusMethod;
      }

      /**
       * Cancels the editing of the custom fields by removing the form and showing the
       * the original element.
       */
      function close () {
        form.remove();
        elem.show();
        form = null;
      }

      /**
       * Workaround bug where href="#" changes the angular route
       */
      function removeFormClearLinksHref () {
        $('a.crm-clear-link', form).removeAttr('href');
      }

      /**
       * Focuses on the first visible input element. It disables datepicker's from
       * popping up when their inputs have been triggered. It restores the normal behaviour
       * after the focus have been applied.
       */
      function focusOnFirstInputWithoutTriggeringCalendars () {
        form.find('input:visible:first')
          .datepicker('option', 'showOn', 'button')
          .focus()
          .datepicker('option', 'showOn', 'focus');
      }

      /**
       * Returns the URL needed to load the custom fields edit form.
       *
       * @returns {string} the form url
       */
      function getCustomFieldsEditFormUrl () {
        return CRM.url('civicrm/case/cd/edit', {
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
      }

      /**
       * Triggered when the edit form loads. Fixes an issue with a's href attributes,
       * Restores the original jQuery's method, and focuses on the first input element.
       */
      function handleFormLoaded () {
        removeFormClearLinksHref();

        $timeout(function () {
          restoreFocusMethod();
          focusOnFirstInputWithoutTriggeringCalendars();
        });
      }

      /**
       * Updates the parent scope by providing the updated custom field values.
       *
       * @param {document#event} event DOM event triggered by the form submission
       * @param {object} data the form submitted data.
       */
      function handleFormSubmit (event, data) {
        scope.$apply(function () {
          scope.pushCaseData(data.civicase_reload[0]);
          close();
        });
      }

      /**
       * Loads the custom field edit form onto the element associated to the directive.
       */
      function loadCustomFieldEditForm () {
        var isFormLoading = !!form;

        if (isFormLoading) {
          return;
        }

        var url = getCustomFieldsEditFormUrl();
        form = $('<div></div>').html(elem.hide().html());

        form.insertAfter(elem)
          .on('click', '.cancel', close)
          .on('crmLoad', handleFormLoaded)
          .on('crmFormSuccess', handleFormSubmit);

        blockFocusMethod();
        CRM.loadForm(url, { target: form });
      }

      /**
       * Restores the original function used by jQuery's focus method.
       */
      function restoreFocusMethod () {
        $.fn.focus = jQueryFocusMethod;
      }
    }
  });
})(angular, CRM.$, CRM._, CRM);
