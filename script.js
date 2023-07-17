require("dotenv").config();
const url = require("url");
const express = require("express");
const pg = require("pg");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

app.get("/", async (req, res) => {
  let client;
  let browser;

  try {
    // Parse the query parameters from the URL
    const queryParams = url.parse(req.url, true).query;
    const username = queryParams.name;

    if (!username) {
      throw new Error(
        "Missing required query parameters: name and/or apartment"
      );
    }

    // Fetch the apartment and plate details from the database
    client = await pool.connect();
    const query = `
      SELECT apartment_number, visitor_code, plate, make, model, color
      FROM apartment
      JOIN users ON users.username = $1
      WHERE apartment_number = (
        SELECT apartment_number
        FROM apartment
        LIMIT 1
      );
    `;

    const result = await client.query(query, [username]);

    if (result.rowCount > 0) {
      browser = await puppeteer.launch({
        // use Chromium installed with `apt` (solves Problem 1)
        executablePath: "/usr/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-gpu"],
      });

      const { apartment_number, visitor_code, plate, make, model, color } =
        result.rows[0];

      const page = await browser.newPage();

      await page.goto("http://registermyplate.com/visitors/");

      await page.setViewport({ width: 1234, height: 1157 });

      await page.waitForSelector("#MainContent_ddl_Property");
      await page.click("#MainContent_ddl_Property");

      await page.waitForSelector("#MainContent_ddl_Property");
      await page.select("#MainContent_ddl_Property", "PRP-Y86UL8");

      await page.waitForSelector("#MainContent_txt_Apartment");
      await page.click("#MainContent_txt_Apartment");

      await page.waitForSelector("#MainContent_txt_Apartment:not([disabled])");
      await page.type("#MainContent_txt_Apartment", apartment_number);

      await page.waitForSelector("#MainContent_txt_VisitorCode");
      await page.click("#MainContent_txt_VisitorCode");

      await page.waitForSelector(
        "#MainContent_txt_VisitorCode:not([disabled])"
      );
      await page.type("#MainContent_txt_VisitorCode", visitor_code);

      await page.waitForSelector("#MainContent_btn_PropertyNext");
      await page.click("#MainContent_btn_PropertyNext");

      await page.waitForSelector("#MainContent_txt_Plate");
      await page.click("#MainContent_txt_Plate");

      await page.waitForSelector("#MainContent_txt_Plate:not([disabled])");
      await page.type("#MainContent_txt_Plate", plate);

      await page.waitForSelector("#MainContent_txt_Make");
      await page.click("#MainContent_txt_Make");

      await page.waitForSelector("#MainContent_txt_Make:not([disabled])");
      await page.type("#MainContent_txt_Make", make);

      await page.waitForSelector("#MainContent_txt_Make");
      await page.keyboard.press("Tab");

      await page.waitForSelector("#MainContent_txt_Model");
      await page.click("#MainContent_txt_Model");

      await page.waitForSelector("#MainContent_txt_Model:not([disabled])");
      await page.type("#MainContent_txt_Model", model);

      await page.waitForSelector("#MainContent_txt_Color");
      await page.click("#MainContent_txt_Color");

      await page.waitForSelector("#MainContent_txt_Color:not([disabled])");
      await page.type("#MainContent_txt_Color", color);

      await page.waitForSelector("#MainContent_btn_Vehicle_Next");
      await page.click("#MainContent_btn_Vehicle_Next");

      await page.waitForSelector("#MainContent_btn_Auth_Next");
      await page.click("#MainContent_btn_Auth_Next");

      await page.waitForSelector(
        "#MainContent_txt_Review_PlateNumber:not([disabled])"
      );
      await page.type("#MainContent_txt_Review_PlateNumber", plate);

      await page.waitForSelector("#MainContent_cb_Confirm");
      await page.click("#MainContent_cb_Confirm");

      await page.waitForSelector("#MainContent_btn_Submit");
      await page.click("#MainContent_btn_Submit");

      await page.waitForSelector("#MainContent_lbl_Results_Expires");
      await page.click("#MainContent_lbl_Results_Expires");

      const text = await page.evaluate(
        () =>
          document.querySelector("#MainContent_lbl_Results_Expires").textContent
      );

      res.send(
        `Success. You're good until ${text} at ${apartment_number}. Car: ${color} ${make} ${model} with ${plate} plate.`
      );
    } else {
      res.send("No matching apartment found.");
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send("An error occurred.");
  } finally {
    if (client) await client.release();
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
