const puppeteer = require('puppeteer');

describe('User Profile Settings Frontend', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should load settings page and update profile', async () => {
    await page.goto('http://localhost:8000/settings.html', { waitUntil: 'networkidle0' });

    // Wait for form inputs to be available
    await page.waitForSelector('#nameInput');
    await page.waitForSelector('#lastnameInput');
    await page.waitForSelector('#emailInput');
    await page.waitForSelector('#phoneInput');
    await page.waitForSelector('#serviceInput');
    await page.waitForSelector('#saveProfileBtn');

    // Fill in form fields
    await page.evaluate(() => {
      document.querySelector('#nameInput').value = 'Test';
      document.querySelector('#lastnameInput').value = 'User';
      document.querySelector('#emailInput').value = 'testuser@example.com';
      document.querySelector('#phoneInput').value = '1234567890';
      document.querySelector('#serviceInput').value = 'Test Service';
    });

    // Click save button
    await page.click('#saveProfileBtn');

    // Wait for notification or some indication of success
    await page.waitForTimeout(1000);

    // Check if notification is shown
    const notificationText = await page.evaluate(() => {
      const notification = document.querySelector('div.fixed.bottom-4.right-4');
      return notification ? notification.textContent : null;
    });

    expect(notificationText).toMatch(/Perfil actualizado correctamente/);
  }, 15000);
});
