'use strict';

module.exports = async (page, scenario, vp) => {
  await require('./case-list.js')(page, scenario, vp);
  // Evaluating the click using browser native click function
  // pupetter is failing to click on the correct div (Opening a random screen)
  await page.evaluate(() => {
    document.querySelector('.civicase__case-list-table tbody tr:first-child .civicase__case-card').click();
  });
};
