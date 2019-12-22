<?php

/**
 * CRM_Civicase_Helper_NewCaseWebform class.
 */
class CRM_Civicase_Helper_NewCaseWebform {

  /**
   * Adds new case webform URL and client data to the options array.
   */
  public static function addWebformDataToOptions(&$options) {
    // Retrieve civicase webform URL.
    $allowCaseWebform = Civi::settings()->get('civicaseAllowCaseWebform');
    $options['newCaseWebformClient'] = 'cid';
    $options['newCaseWebformUrl'] = $allowCaseWebform
      ? Civi::settings()->get('civicaseWebformUrl')
      : NULL;

    if ($options['newCaseWebformUrl']) {
      $path = explode('/', $options['newCaseWebformUrl']);
      $webformId = array_pop($path);
      $clientId = self::getCaseWebformClientId($webformId);

      if ($clientId) {
        $options['newCaseWebformClient'] = 'cid' . $clientId;
      }
    }
  }

  /**
   * Returns the contact id of the client for given webform id.
   *
   * @param int $webform_id
   *   Webform id.
   *
   * @return int
   *   Contact id.
   */
  public static function getCaseWebformClientId($webform_id) {
    $node = node_load($webform_id);
    $data = $node->webform_civicrm['data'];
    $client = 0;

    if (isset($data['case'][1]['case'][1]['client_id'])) {
      $clients = $data['case'][1]['case'][1]['client_id'];
      $client = reset($clients);
    }

    return $client;
  }

}
