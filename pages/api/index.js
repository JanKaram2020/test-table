// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

const handler = async (req, res) => {
  try {
    if (req.method === "POST") {
      const body = req.body;
      if (!body.type) {
        return res.status(400).json({ error: "type is required" });
      }
      if (body.type !== "code" && body.type !== "name") {
        return res.status(400).json({ error: "type is name or code" });
      }
      const browser = process.env.AWS_LAMBDA_FUNCTION_VERSION
        ? await puppeteer.launch({
            args: [
              ...chrome.args,
              "--hide-scrollbars",
              "--disable-web-security",
            ],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
          })
        : await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(
        "http://www.sci.p.alexu.edu.eg/ar/Academics/ExamTableTime/2018/"
      );
      //get all rows of the table that contains the codes
      const rows = await page.$$("tr");
      const times = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = await row.$$("td");
        const code = await cells[0]?.evaluate((el) => el.textContent);
        const name = await cells[2]?.evaluate((el) => el.textContent);
        if (body.type === "code") {
          if (!body.data) {
            return res.status(400).json({ error: "no codes" });
          }
          if (code && body.data.includes(code)) {
            const time = await cells[4]?.evaluate((el) => el.textContent);
            if (time && name) {
              times.push({ name, time });
            }
          }
        }
        if (body.type === "name") {
          if (!body.data) {
            return res.status(400).json({ error: "no names" });
          }
          if (name && body.data.includes(name)) {
            const time = await cells[4]?.evaluate((el) => el.textContent);
            if (time && name) {
              times.push({ name, time });
            }
          }
        }
      }
      if (times.length === 0) {
        if (body.type === "code") {
          return res
            .status(400)
            .json({ error: "no subject with entered codes found" });
        }
        if (body.type === "name") {
          return res
            .status(400)
            .json({ error: "no subject with entered names found" });
        }
      }
      return res.json(times);
    }
  } catch (e) {
    res.status(500).json({ error: e.message || e.toString() });
  }
};
export default handler;
