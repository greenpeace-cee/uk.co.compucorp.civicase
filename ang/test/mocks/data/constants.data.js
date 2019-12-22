((angular) => {
  const module = angular.module('civicase.data');

  CRM['civicase-base'].allowMultipleCaseClients = true;
  CRM['civicase-base'].allowCaseLocks = false;
  CRM['civicase-base'].defaultCaseCategory = 'cases';
  CRM['civicase-base'].newCaseWebformClient = 'cid';
  CRM['civicase-base'].newCaseWebformUrl = null;

  module.config(($provide) => {
    $provide.constant('allowMultipleCaseClients', CRM['civicase-base'].allowMultipleCaseClients);
    $provide.constant('allowCaseLocks', CRM['civicase-base'].allowCaseLocks);
    $provide.constant('defaultCaseCategory', CRM['civicase-base'].defaultCaseCategory);
    $provide.constant('newCaseWebformClient', CRM['civicase-base'].newCaseWebformClient);
    $provide.constant('newCaseWebformUrl', CRM['civicase-base'].newCaseWebformUrl);
  });
})(angular);
