<?php

use CRM_Civicase_Helper_CaseCategory as CaseCategoryHelper;

/**
 * CRM_Civicase_Hook_PreProcess_ProcessCaseCategoryCustomFieldsForEdit class.
 */
class CRM_Civicase_Hook_PreProcess_ProcessCaseCategoryCustomFieldsForEdit {

  /**
   * Processes/Displays the case category custom fields.
   *
   * The case category custom fields on Manage Case category page will not work
   * well without this, basically custom field for the case category and their
   * default values are set here and their values can be edited.
   *
   * @param string $formName
   *   Form name.
   * @param CRM_Core_Form $form
   *   Form object class.
   */
  public function run($formName, CRM_Core_Form &$form) {
    if (!$this->shouldRun($formName)) {
      return;
    }

    $caseId = CRM_Utils_Request::retrieve('entityID', 'Positive', $form, TRUE);
    $caseCategoryName = CaseCategoryHelper::getCategoryName($caseId);

    if ($caseCategoryName == 'Cases') {
      return;
    }

    $this->processCaseCategoryCustomFieldsForEdit($form, $caseCategoryName);
  }

  /**
   * Processes the Case Category custom fields.
   *
   * Allows them to be editable for case categories other than 'Case'.
   *
   * @param CRM_Core_Form $form
   *   Form name.
   * @param string $caseCategoryName
   *   Case Category name.
   */
  private function processCaseCategoryCustomFieldsForEdit(CRM_Core_Form &$form, $caseCategoryName) {
    $caseTypeId = CRM_Utils_Request::retrieve('subType', 'Positive', $form, TRUE);
    $form->addElement('hidden', 'autofocus', TRUE);
    CRM_Custom_Form_CustomData::preProcess($form, NULL, $caseTypeId, 1, $caseCategoryName);
    CRM_Custom_Form_CustomData::buildQuickForm($form);
    CRM_Core_BAO_CustomGroup::setDefaults($form->_groupTree, $form->_defaults);
    $form->setDefaults($form->_defaults);
  }

  /**
   * Determines if the hook will run.
   *
   * @param string $formName
   *   Form name.
   *
   * @return bool
   *   returns TRUE or FALSE.
   */
  private function shouldRun($formName) {
    return $formName == CRM_Case_Form_CustomData::class;
  }

}
