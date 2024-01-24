const fs = require('fs');
const puppeteer = require('puppeteer');

// ...（你的导入和延时函数）

(async () => {
  try {
    const accountsJson = fs.readFileSync('accounts.json', 'utf-8');
    const accounts = JSON.parse(accountsJson);

    for (const account of accounts) {
      const { username, password } = account;

      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      try {
        await page.goto('http://cpanel.byethost.com/');

        // 等待登录表单出现
        await page.waitForSelector('#login2FAMail');

        // 清空输入字段
        await page.$eval('#login2FAMail', input => input.value = '');
        await page.$eval('#login2FAPassword', input => input.value = '');

        // 输入用户名和密码
        await page.type('#login2FAMail', username);
        await page.type('#login2FAPassword', password);

        // 点击登录按钮
        await Promise.all([
          page.waitForNavigation(),
          page.click('#login2faButton'),
        ]);

        // 检查登录是否成功
        const isLoggedIn = await page.$('.button-loading[title="载入中..."]') === null;

        if (isLoggedIn) {
          console.log(`账号 ${username} 登录成功！`);
        } else {
          throw new Error(`账号 ${username} 登录失败。请检查凭据。`);
        }
      } catch (error) {
        console.error(`账号 ${username} 登录错误：${error.message}`);
      } finally {
        await page.close();
        await browser.close();

        // 在用户之间添加随机延迟
        const delay = Math.floor(Math.random() * 5000) + 1000;
        await delayTime(delay);
      }
    }

    console.log('所有账号成功登录！');
  } catch (mainError) {
    console.error(`主要错误：${mainError.message}`);
  }
})();

// 自定义延时函数
function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
