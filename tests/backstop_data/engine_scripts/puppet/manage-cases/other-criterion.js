'use strict';

module.exports = async (page, scenario, vp) => {
  await require('./case-list.js')(page, scenario, vp);
  await page.click('.civicase__case-filter-panel__button[ng-show="!expanded"]');
};
