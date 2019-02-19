'use strict';

module.exports = async (page, scenario, vp) => {
  await require('./contact-case-tab.js')(page, scenario, vp);
  await page.waitForSelector('.civicase__loading-placeholder__oneline', { hidden: true });
};
