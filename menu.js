const puppeteer = require('puppeteer');

const getNewMenuItems = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const menuItems = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/recipes/') && !url.includes('.jpeg')) {
      try {
        const data = await response.json();
        menuItems.push({
          name: data['name_with_subtitle'],
          card_url: data['recipe_card_url']
        });
      } catch(error) {
      }
    }
  });

  await page.goto('https://dinnerly.com/login');

  await page.type('#login_email', process.env.USERNAME);
  await page.type('#password', process.env.PASSWORD);
  await page.click('#login_form button[type=submit]');

  const mealsSelector = '#current_orders .in-progress .current-recipe__cooking-instructions';
  await page.waitForSelector(mealsSelector);

  // the navigation means we can't reuse the list of objects from page.$$()
  for (let i = 0; i < 3; ++i) {
    const meals = await page.$$(mealsSelector);
    await meals[i].click();
    await page.waitForTimeout(3000);

    await page.goBack();
    await page.waitForTimeout(1000);
  }

  await browser.close();

  return menuItems;
}
exports.getNewMenuItems = getNewMenuItems;
