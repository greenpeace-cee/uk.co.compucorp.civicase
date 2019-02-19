'use strict';

module.exports = async (page, scenario, vp) => {
  await page.click('.ui-tabs-anchor[title="Cases"]');
  await page.waitForSelector('.civicase__contact-cases-tab-container', { visible: true });
};
