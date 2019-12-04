(function (angular, $, _, CRM) {
  var module = angular.module('civicase-base');

  module.provider('CaseTypeCategory', CaseTypeCategoryProvider);

  /**
   * CaseTypeCategory Service Provider
   */
  function CaseTypeCategoryProvider () {
    var allCaseTypeCategories = CRM['civicase-base'].caseTypeCategories;

    this.$get = $get;
    this.getAll = getAll;
    this.findByName = findByName;

    /**
     * Returns the case the category service.
     *
     * @returns {object} the case type service.
     */
    function $get () {
      return {
        getAll: getAll,
        findByName: findByName
      };
    }

    /**
     * Returns all case type categories.
     *
     * @returns {object[]} all the case type categories.
     */
    function getAll () {
      return allCaseTypeCategories;
    }

    /**
     * Find case type category by name
     *
     * @param {string} caseTypeCategoryName case type category name
     * @returns {object} case type category object
     */
    function findByName (caseTypeCategoryName) {
      return _.find(allCaseTypeCategories, function (category) {
        return category.name === caseTypeCategoryName;
      });
    }
  }
})(angular, CRM.$, CRM._, CRM);
