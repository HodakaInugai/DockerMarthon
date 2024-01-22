const express = require("express");
const app = express();
const cors = require("cors");
const { Pool } = require("pg");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORSミドルウェアの設定
const corsOptions = {
  origin: "http://dev.marathon.rplearn.net", // 許可するオリジンを指定
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

const pool = new Pool({
  user: "user_hodaka_inugai",
  host: "localhost",
  database: "db_hodaka_inugai",
  password: "pass",
  port: 5432,
});

const port = 3324;
const apiUrl = 'http://localhost:3324'; // 追加

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customer", async (req, res) =>
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const customerData = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customerId]);

    if (customerData.rows.length > 0) {
      res.json({ success: true, customer: customerData.rows[0] });
    } else {
      res.json({ success: false, message: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});

app.delete("/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const deleteResult = await pool.query("DELETE FROM customers WHERE customer_id = $1 RETURNING *", [customerId]);

    if (deleteResult.rows.length > 0) {
      res.json({ success: true, message: "Customer deleted successfully" });
    } else {
      res.json({ success: false, message: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/add-customer", async (req, res) => {
  try {
    console.log(req.body);

    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.put("/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const { companyName, industry, contact, location } = req.body;

    const updatedCustomer = await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4 WHERE customer_id = $5 RETURNING *",
      [companyName, industry, contact, location, customerId]
    );

    if (updatedCustomer.rows.length > 0) {
      // アップデート成功後、一覧画面に遷移
      res.json({ success: true, customer: updatedCustomer.rows[0], redirectTo: 'list.html' });
    } else {
      res.json({ success: false, message: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


