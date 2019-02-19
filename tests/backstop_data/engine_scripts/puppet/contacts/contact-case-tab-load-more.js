'use strict';

module.exports = async (page, scenario, vp) => {
  await require('./contact-case-tab-details.js')(page, scenario, vp);
  await page.click('.civicase__contact-case-tab__case-list__footer button');
};
