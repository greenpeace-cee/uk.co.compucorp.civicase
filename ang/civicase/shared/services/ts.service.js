(function (angular, _, crmTs) {
  var module = angular.module('civicase');
  var CIVICASE_DOMAIN = 'uk.co.compucorp.civicase';

  module.factory('ts', function () {
    return ts;
  });

  function ts (message, options) {
    return crmTs(message, _.assign({}, {
      domain: CIVICASE_DOMAIN
    }, options || {}));
  }
})(angular, CRM._, window.ts);
