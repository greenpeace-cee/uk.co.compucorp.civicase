(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivitiesCalendar', function ($timeout, $uibPosition) {
    return {
      scope: {
        activities: '=',
        caseId: '=',
        refresh: '=refreshCallback'
      },
      controller: 'civicaseActivitiesCalendarController',
      templateUrl: '~/civicase/ActivitiesCalendar.html',
      restrict: 'E',
      link: civicaseActivitiesCalendarLink
    };

    /**
     * AngularJS's link function for the civicase activity calendar directive.
     *
     * @param {Object} $scope
     * @param {Object} element
     */
    function civicaseActivitiesCalendarLink ($scope, element) {
      var bootstrapThemeContainer = $('#bootstrap-theme');
      var popover = element.find('.activities-calendar-popover');
      var popoverArrow = popover.find('.arrow');

      (function init () {
        $scope.$on('civicaseActivitiesCalendar::openActivitiesPopover', openActivitiesPopover);
        $scope.$on('civicaseActivitiesCalendar::refreshDatepicker', function () {
          var datepickerScope = element.find('[uib-datepicker]').isolateScope();

          datepickerScope.datepicker.refreshView();
        });
      })();

      /**
       * Adjusts the position of the popover element if hidden by the window's limits.
       * For example, if the popover is hidden by the right window limit, it will position
       * the popover relative to the bottom left of the element.
       *
       * @param {Object} element a jQuery reference to the element to position the popover against.
       */
      function adjustPopoverIfHiddenByWindowsLimits (element) {
        var popoverArrowWidth = 22; // needs to be harcoded because how it is defined in Bootstrap
        var isHidden = {
          right: popover.position().left + popover.width() > $(window).width(),
          left: popover.position().left - popover.width() < 0
        };

        if (isHidden.right) {
          adjustPopoverToElement({
            element: element,
            direction: 'bottom-right',
            arrowPosition: 'calc(100% - ' + popoverArrowWidth + 'px)',
            arrowAdjustment: (popoverArrowWidth / 2)
          });
        } else if (isHidden.left) {
          adjustPopoverToElement({
            element: element,
            direction: 'bottom-left',
            arrowPosition: popoverArrowWidth + 'px',
            arrowAdjustment: -(popoverArrowWidth / 2)
          });
        }
      }

      /**
       * Adjusts the popover's position against the provided element and in the desired position direction.
       *
       * @param {Object} adjustments
       * @param {Object} adjustments.element the jQuery reference to the element to position the popover against.
       * @param {String} adjustments.direction the direction to position the popover against. Can be one of top, left, bottom, right,
       *   or combinations such as bottom-right, etc.
       * @param {String} adjustments.arrowPosition the popover's arrow position
       * @param {Number} adjustments.arrowAdjustment this value can be used to make small adjustments to the popover
       *   based on the position of the arrow so they can be aligned properly.
       */
      function adjustPopoverToElement (adjustments) {
        var bodyOffset = $uibPosition.positionElements(adjustments.element, popover, adjustments.direction, true);

        popoverArrow.css('left', adjustments.arrowPosition);
        popover.css({
          left: bodyOffset.left - bootstrapThemeContainer.offset().left + adjustments.arrowAdjustment
        });
      }

      /**
       * Closes the activities dropdown but only when clicking outside the popover
       * container. Also unbinds the mouseup event in order to reduce the amount
       * of active DOM event listeners.
       *
       * @param {Event} event DOM event triggered by the user mouse up action.
       */
      function closeActivitiesDropdown (event) {
        // Note: it breaks when checking `popover.is(event.target)`.
        var isNotPopover = !$(event.target).is('.activities-calendar-popover');
        var notInsidePopover = popover.has(event.target).length === 0;

        if (isNotPopover && notInsidePopover) {
          popover.hide();
          $(document).unbind('mouseup', closeActivitiesDropdown);
        }
      }

      /**
       * Displays the popover on top of the calendar's current active day.
       */
      function displayPopoverOnTopOfActiveDay () {
        // the current active day can only be determined in the next cicle:
        $timeout(function () {
          var activeDay = element.find('.uib-day .active');

          popover.show();
          popover.appendTo(bootstrapThemeContainer);

          positionPopoverOnTopOfElement(activeDay);

          // reset popover arrow's alignment:
          popoverArrow.css('left', '50%');

          adjustPopoverIfHiddenByWindowsLimits(activeDay);
        });
      }

      /**
       * Opens up the activities popover and binds the mouseup event in order
       * to close the popover.
       */
      function openActivitiesPopover () {
        displayPopoverOnTopOfActiveDay();
        $(document).bind('mouseup', closeActivitiesDropdown);
      }

      function positionPopoverOnTopOfElement (element) {
        var bodyOffset = $uibPosition.positionElements(element, popover, 'bottom', true);

        popover.css({
          top: bodyOffset.top - bootstrapThemeContainer.offset().top,
          left: bodyOffset.left - bootstrapThemeContainer.offset().left
        });
      }
    }
  });

  module.controller('civicaseActivitiesCalendarController', civicaseActivitiesCalendarController);

  function civicaseActivitiesCalendarController ($scope, formatActivity) {
    $scope.selectedActivites = [];
    $scope.selectedDate = null;
    $scope.calendarOptions = {
      customClass: getDayCustomClass,
      formatDay: 'd',
      showWeeks: false,
      startingDay: 1
    };

    $scope.onDateSelected = onDateSelected;

    (function init () {
      $scope.$watch('activities', function () {
        $scope.$broadcast('civicaseActivitiesCalendar::refreshDatepicker');
      }, true);
    })();

    /**
     * Determines if all the given activities have been completed.
     *
     * @param {Array} activities
     */
    function checkIfAllActivitiesHaveBeenCompleted (activities) {
      return _.every(activities, function (activity) {
        return _.includes(CRM.civicase.activityStatusTypes.completed, +activity.status_id);
      });
    }

    /**
     * Returns the activities that belong to the given date.
     *
     * @param {Date} date
     */
    function getActivitiesForDate (date) {
      return $scope.activities.filter(function (activity) {
        return moment(activity.activity_date_time).isSame(date, 'day');
      });
    }

    /**
     * Returns the class that the given date should have depending on the status
     * of all the activities for the date.
     *
     * @param {Object} params
     * @param {Date}   params.date the given date that requires the class
     * @param {String} params.mode the current viewing mode of the calendar.
     *   can be "day", "month", or "year".
     */
    function getDayCustomClass (params) {
      var allActivitiesHaveBeenCompleted;
      var activities = getActivitiesForDate(params.date);
      var isDateInThePast = moment().isAfter(params.date, 'day');
      var isInCurrentMonth = this.datepicker.activeDate.getMonth() === params.date.getMonth();

      if (!isInCurrentMonth && params.mode === 'day') {
        return 'invisible';
      }

      if (activities.length === 0 || params.mode !== 'day') {
        return;
      }

      allActivitiesHaveBeenCompleted = checkIfAllActivitiesHaveBeenCompleted(activities);

      if (allActivitiesHaveBeenCompleted) {
        return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--completed';
      } else if (isDateInThePast) {
        return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--overdue';
      } else {
        return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--scheduled';
      }
    }

    /**
     * Stores the activities that are on the same date as the calendar's
     * selected date. Triggers when the calendar date changes.
     */
    function onDateSelected () {
      $scope.selectedActivites = $scope.activities
        .filter(function (activity) {
          return moment(activity.activity_date_time).isSame($scope.selectedDate, 'day');
        })
        .map(function (activity) {
          return formatActivity(activity, $scope.caseId);
        });

      if ($scope.selectedActivites.length) {
        $scope.$emit('civicaseActivitiesCalendar::openActivitiesPopover');
      }
    }
  }
})(CRM.$, CRM._, angular);
