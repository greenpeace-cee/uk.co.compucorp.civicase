<?php

use CRM_Civicase_Service_CaseCategoryMenu as CaseCategoryMenuService;

/**
 * Class CRM_Civicase_Hook_PostProcess_CaseCategoryMenuLinksProcessor.
 */
class CRM_Civicase_Hook_PostProcess_CaseCategoryMenuLinksProcessor {

  /**
   * Case Category Menu Links Processor.
   *
   * Creates/Deletes menus for the Case category option group is saved/deleted
   * based on the form action.
   *
   * @param string $formName
   *   Form name.
   * @param CRM_Core_Form $form
   *   Form object class.
   */
  public function run($formName, CRM_Core_Form &$form) {
    if (!$this->shouldRun($form, $formName)) {
      return;
    }

    $caseCategoryMenu = new CaseCategoryMenuService();
    $formAction = $form->getVar('_action');
    if ($formAction == CRM_Core_Action::DELETE) {
      $caseCategoryValues = $form->getVar('_values');
      $caseCategoryMenu->deleteItems($caseCategoryValues['name']);
    }

    if ($formAction == CRM_Core_Action::ADD) {
      $formValues = $form->_submitValues;
      $caseCategoryMenu->createItems($formValues['label']);
    }
  }

  /**
   * Determines if the hook will run.
   *
   * @param CRM_Core_Form $form
   *   Form object class.
   * @param string $formName
   *   Form name.
   *
   * @return bool
   *   returns TRUE or FALSE.
   */
  private function shouldRun(CRM_Core_Form $form, $formName) {
    $optionGroupName = $form->getVar('_gName');
    return $formName == 'CRM_Admin_Form_Options' && $optionGroupName == 'case_type_categories';
  }

}
