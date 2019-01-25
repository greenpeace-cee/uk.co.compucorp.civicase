'use strict';

module.exports = async (page, scenario, vp) => {
  await require('./../manage-cases/select-case.js')(page, scenario, vp);

  await page.click('.civicase__case-body_tab > li:nth-child(1) a');
  await page.waitFor(300); // Wait for animation to complete
};
