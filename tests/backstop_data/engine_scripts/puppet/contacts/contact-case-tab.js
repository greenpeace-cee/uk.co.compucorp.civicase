'use strict';

module.exports = async (page, scenario, vp) => {
  await page.waitForSelector('.civicase__contact-cases-tab-container', { visible: true });
};
