require('dotenv').config();
const express = require("express");
const path = require('path');
const fs = require("fs");
const api = require("./mealkitApi");

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

process.on('SIGINT', function() {
    process.exit();
});

const getRecipes = () => {
  const text = fs.readFileSync("./menu.json", { encoding: "utf8", flag: "r" });
  const resp = JSON.parse(text);

  if (!('data' in resp)) {
    return [];
  }
  return resp.data.customer.orders[0].contents.uncookedRecipes;
};

app.get("/", (req, res) => {
  res.setHeader("content-type", "text/html; charset=utf-8");

  res.write("<html>");
  res.write("<table>");
  res.write("<tr>");

  const recipes = getRecipes();
  for (var i = 0; i < recipes.length; ++i) {
    res.write("<td>");
    res.write(`<a href="/recipe/${i}">`);
    res.write(`<img src="${recipes[i].image.url}" width=200 />`);
    res.write(` <h1>${recipes[i].title}</h1>`);
    res.write(` <h2>${recipes[i].subtitle}</h2>`);
    res.write(` <h5>${recipes[i].duration.from} - ${recipes[i].duration.to} ${recipes[i].duration.unit}</h5>`);
    res.write("</a>");
    res.write("</td>");
  }
  res.write("</tr>");
  res.write("</table>");

  res.write('<a href="/refresh">Refresh menu</a>');
  res.end();
});

app.get('/recipe/:num', async (req, res) => {
  const recipes = getRecipes();

  res.render('recipe', { recipe: recipes[req.params.num] });
});

app.get("/refresh", async (req, res) => {
  const data = await api.getCurrentOrder(process.env.USERNAME, process.env.PASSWORD);
  let text = JSON.stringify(data);

  fs.unlinkSync("./menu.json");
  fs.writeFileSync("./menu.json", text);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Configured as ${process.env.USERNAME}`);
  console.log(`Listening on port ${port}`);
});
