/* eslint-env jasmine */

(function (CRM) {
  CRM['civicase-base'] = {};
  CRM.civicase = {};
  CRM.angular = { requires: {} };
  /**
   * Dependency Injection for civicase module, defined in ang/civicase.ang.php
   * For unit testing they needs to be mentioned here
   */
  CRM.angular.requires.civicase = ['civicase-base', 'crmAttachment', 'crmUi', 'crmUtil', 'ngRoute', 'angularFileUpload', 'bw.paging', 'crmRouteBinder', 'crmResource', 'ui.bootstrap', 'uibTabsetClass', 'dialogService'];

  CRM.loadForm = jasmine.createSpy('loadForm');
  CRM.url = jasmine.createSpy('url').and.callFake((url) => url);

  // Common utility functions for tests
  CRM.testUtils = {

    /**
     * Given a full url, it extracts the querystring parameters, making sure
     * to decode and parse any value that is an encoded JSON object
     *
     * @param {string} url url
     * @returns {object} parameters
     */
    extractQueryStringParams: function (url) {
      var queryString, paramsCouples;

      queryString = url.split('?')[1];

      if (!queryString) {
        return {};
      }

      paramsCouples = queryString.split('&');

      return paramsCouples.reduce(function (acc, couple) {
        var coupleKeyVal = couple.split('=');

        acc[coupleKeyVal[0]] = coupleKeyVal[1].match(/^%7B.+%7D/)
          ? JSON.parse(decodeURIComponent(coupleKeyVal[1]))
          : coupleKeyVal[1];

        return acc;
      }, {});
    }
  };
}(CRM));
