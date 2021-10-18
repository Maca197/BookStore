const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  "981773859901-2dm64pdvm5887beeotjqpe02a55ptvuc.apps.googleusercontent.com",
  "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",
  "urn:ietf:wg:oauth:2.0:oob"
);

oAuth2Client.setCredentials({
  access_token:
      "ya29.a0ARrdaM-G8Zkc84dddr9g2TUbbaZERSP_dRkr0ZCpX8ft9xG9XH4wbU9QY-xezJGkQ4hg_0Wl8u2Anv5NgGU7WkCjCzLaj-fpgcD__JuBKbhmYF4a1pADF30-JfBZB9FkCDGrV3sg_izuqvQT1PjwCiCG03ZZ",
  refresh_token:
      "1//0f9Kbn19eL6f_CgYIARAAGA8SNwF-L9IriecMnzEd5eO_jVJtutd0BG6uBsukMBkMbNsgkj15FmoMxBhRkSCPm05kYGtUXFR3Rwg",
  scope: "https://www.googleapis.com/auth/spreadsheets",
  token_type: "Bearer",
  expiry_date: 1634511765272,
});

const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

async function read() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "1-VYb1V6V_gd40zU-QUjAkmSv5ugGLld-qOMWjQfGmSc",
    range: "Products!A2:G",
  });

  const rows = response.data.values;
  const products = rows.map((row) => ({
    id: +row[0],
    name: row[1],
    autor: row[2],
    desc: row[3],
    price: +row[4],
    image: row[5],
    stock: +row[6],
  }));

  return products;
}

async function write(products) {
  let values = products.map((p) => [p.id, p.name,p.autor, p.price, p.image, p.stock]);

  const resource = {
    values,
  };
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: "1-VYb1V6V_gd40zU-QUjAkmSv5ugGLld-qOMWjQfGmSc",
    range: "Products!A2:G",
    valueInputOption: "RAW",
    resource,
  });
}

async function writeOrders(orders) {
  let values = orders?.map((order) => [
    order.date,
    order.preferenceId,
    order.shipping.name,
    order.shipping.email,
    JSON.stringify(order.items),
    JSON.stringify(order.shipping),
    order.status,
  ]);

  const resource = {
    values,
  };
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: "1-VYb1V6V_gd40zU-QUjAkmSv5ugGLld-qOMWjQfGmSc",
    range: "Orders!A2:G",
    valueInputOption: "RAW",
    resource,
  });
}

async function readOrders() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "1-VYb1V6V_gd40zU-QUjAkmSv5ugGLld-qOMWjQfGmSc",
    range: "Orders!A2:G",
  });

  const rows = response.data.values;
  const orders = rows?.map((row) => ({
    date: row[0],
    preferenceId: row[1],
    name: row[2],
    email: row[3],
    items: JSON.parse(row[4]),
    shipping: JSON.parse(row[5]),
    status: row[6],
  }));

  return orders;
}

async function updateOrderByPreferenceId(preferenceId, status) {
  const orders = await readOrders();
  const order = orders.find(o => o.preferenceId === preferenceId)
  order.status = status;
  await writeOrders(orders);
}

module.exports = {
  read,
  write,
  writeOrders,
  updateOrderByPreferenceId,
  readOrders,
};
