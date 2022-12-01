require('dotenv').config();
const express = require("express");
const fs = require("fs");
const menu = require("./menu");

const app = express();
const port = process.env.PORT || 3000;

process.on('SIGINT', function() {
    process.exit();
});

app.get("/", (req, res) => {
  const text = fs.readFileSync("./menu.json", { encoding: "utf8", flag: "r" });
  const data = JSON.parse(text);

  res.setHeader("content-type", "text/html; charset=utf-8");

  res.write("<html>");
  res.write("<head><style>ul li { padding: 5px }</style>");
  res.write("<ul>");
  for (var i = 0; i < data.length; ++i) {
    res.write("<li>");
    res.write(`<a href="${data[i].card_url}">${data[i].name}</a>\n`);
    res.write("</li>");
  }
  res.write("</ul>");

  res.write('<a href="/refresh">Refresh menu</a>');
  res.end();
});

app.get("/refresh", async (req, res) => {
  const menuItems = await menu.getNewMenuItems();
  let text = JSON.stringify(menuItems);

  fs.unlinkSync("./menu.json");
  fs.writeFileSync("./menu.json", text);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
