<?php

/**
 * @file
 * Declares an Angular module which can be autoloaded in CiviCRM.
 *
 * See also:
 * http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_angularModules.
 */

use Civi\CCase\Utils as Utils;
use CRM_Civicase_Helper_OptionValues as OptionValuesHelper;
use CRM_Civicase_Helper_GlobRecursive as GlobRecursive;

$options = [
  'activityTypes' => 'activity_type',
  'activityStatuses' => 'activity_status',
  'caseStatuses' => 'case_status',
  'priority' => 'priority',
  'activityCategories' => 'activity_category',
  'caseTypeCategories' => 'case_type_categories',
];

OptionValuesHelper::setToJsVariables($options);
set_case_types_to_js_vars($options);
set_relationship_types_to_js_vars($options);
set_file_categories_to_js_vars($options);
set_activity_status_types_to_js_vars($options);
set_custom_fields_info_to_js_vars($options);
set_tags_to_js_vars($options);

/**
 * Get a list of JS files.
 *
 * @return array
 *   list of js files
 */
function get_base_js_files() {
  return array_merge([
    'ang/civicase-base.js',
  ], GlobRecursive::get(dirname(__FILE__) . '/civicase-base/*.js'));
}

/**
 * Sets the case types to javascript global variable.
 */
function set_case_types_to_js_vars(&$options) {
  $caseTypes = civicrm_api3('CaseType', 'get', [
    'return' => [
      'id', 'name', 'title', 'description', 'definition', 'case_type_category',
    ],
    'options' => ['limit' => 0, 'sort' => 'weight'],
    'is_active' => 1,
  ]);
  foreach ($caseTypes['values'] as &$item) {
    CRM_Utils_Array::remove($item, 'is_forkable', 'is_forked');
  }
  $options['caseTypes'] = $caseTypes['values'];
}

/**
 * Sets the relationship types to javascript global variable.
 */
function set_relationship_types_to_js_vars(&$options) {
  $result = civicrm_api3('RelationshipType', 'get', [
    'is_active' => 1,
    'options' => ['limit' => 0],
  ]);
  $options['relationshipTypes'] = $result['values'];
}

/**
 * Sets the tags and tagsets to javascript global variable.
 */
function set_tags_to_js_vars(&$options) {
  $options['tags'] = CRM_Core_BAO_Tag::getColorTags('civicrm_case');
  $options['tagsets'] = CRM_Utils_Array::value('values', civicrm_api3('Tag', 'get', [
    'sequential' => 1,
    'return' => ["id", "name"],
    'used_for' => ['LIKE' => "%civicrm_case%"],
    'is_tagset' => 1,
  ]));
}

/**
 * Sets the file categories to javascript global variable.
 */
function set_file_categories_to_js_vars(&$options) {
  $options['fileCategories'] = CRM_Civicase_FileCategory::getCategories();
}

/**
 * Sets the activity status types to javascript global variable.
 */
function set_activity_status_types_to_js_vars(&$options) {
  $options['activityStatusTypes'] = [
    'incomplete' => array_keys(\CRM_Activity_BAO_Activity::getStatusesByType(CRM_Activity_BAO_Activity::INCOMPLETE)),
    'completed' => array_keys(\CRM_Activity_BAO_Activity::getStatusesByType(CRM_Activity_BAO_Activity::COMPLETED)),
    'cancelled' => array_keys(\CRM_Activity_BAO_Activity::getStatusesByType(CRM_Activity_BAO_Activity::CANCELLED)),
  ];
}

/**
 * Sets the custom fields information to javascript global variable.
 */
function set_custom_fields_info_to_js_vars(&$options) {
  $result = civicrm_api3('CustomGroup', 'get', [
    'sequential' => 1,
    'return' => ['extends_entity_column_value', 'title', 'extends'],
    'extends' => ['IN' => ['Case', 'Activity']],
    'is_active' => 1,
    'options' => ['sort' => 'weight'],
    'api.CustomField.get' => [
      'is_active' => 1,
      'is_searchable' => 1,
      'return' => [
        'label', 'html_type', 'data_type', 'is_search_range',
        'filter', 'option_group_id',
      ],
      'options' => ['sort' => 'weight'],
    ],
  ]);
  $options['customSearchFields'] = $options['customActivityFields'] = [];
  foreach ($result['values'] as $group) {
    if (!empty($group['api.CustomField.get']['values'])) {
      if ($group['extends'] == 'Case') {
        if (!empty($group['extends_entity_column_value'])) {
          $group['caseTypes'] = CRM_Utils_Array::collect('name', array_values(array_intersect_key($caseTypes['values'], array_flip($group['extends_entity_column_value']))));
        }
        foreach ($group['api.CustomField.get']['values'] as $field) {
          $group['fields'][] = Utils::formatCustomSearchField($field);
        }
        unset($group['api.CustomField.get']);
        $options['customSearchFields'][] = $group;
      }
      else {
        foreach ($group['api.CustomField.get']['values'] as $field) {
          $options['customActivityFields'][] = Utils::formatCustomSearchField($field) + ['group' => $group['title']];
        }
      }
    }
  }
}

return [
  'js' => get_base_js_files(),
  'settings' => $options,
];
