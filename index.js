const express = require("express");
const db = require("./db/config");

const crypto = require("crypto");
const pug = require("pug");

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

/**
 * Index request
 * @name index
 * @type GET
 */
app.get("/", async (_, res) => {
	try {
		const data = await db.execute("SELECT * FROM products");
		res.render("index", { products: data.rows });
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "An error occurred while fetching data." });
	}
});

/**
 * Submit request - add new item
 * @name submit
 * @type POST
 */
app.post("/submit", async (req, res) => {
	const product = {
		id: crypto.randomUUID(),
		name: req.body.name,
		quantity: Number(req.body.quantity),
		unit: req.body.unit,
	};

	const template = pug.compileFile("views/includes/product.pug");

	try {
		await db.execute(
			`INSERT INTO products (id, name, quantity, unit) VALUES ("${product.id}", "${product.name}", "${product.quantity}", "${product.unit}");`
		);

		const markup = template({ product });
		res.send(markup);
	} catch (error) {
		console.log("ERROR", error);
	}
});

/**
 * Get by id request - get item by id
 * @name :id
 * @type GET
 */
app.get("/:id", async (req, res) => {
	const id = req.params.id;
	const template = pug.compileFile("views/includes/product.pug");

	try {
		const productData = await db.execute(
			`SELECT * FROM products WHERE id=("${id}");`
		);

		const product = productData.rows[0];

		const markup = template({ product });
		res.send(markup);
	} catch (error) {
		console.log("ERROR", error);
	}
});

/**
 * Edit form by id request - return edit form
 * @name edit-form/:id
 * @type GET
 */
app.get("/edit-form/:id", async (req, res) => {
	const id = req.params.id;
	const template = pug.compileFile("views/includes/edit-item-form.pug");

	try {
		const productData = await db.execute(
			`SELECT * FROM products WHERE id=("${id}");`
		);

		const product = productData.rows[0];

		const markup = template({ product });
		res.send(markup);
	} catch (error) {
		console.log("ERROR", error);
	}
});

/**
 * Edit item by id request - return edited item
 * @name edit/:id
 * @type PUT
 */
app.put("/edit/:id", async (req, res) => {
	const product = {
		id: req.params.id,
		name: req.body.name,
		quantity: Number(req.body.quantity),
		unit: req.body.unit,
	};

	const template = pug.compileFile("views/includes/edit-item.pug");

	try {
		await db
			.execute(
				`UPDATE Products SET name=("${product.name}"), quantity=("${product.quantity}"), unit=("${product.unit}") WHERE id=("${product.id}");`
			)
			.then(() => {
				const markup = template({ product });
				res.send(markup);
			});
	} catch (error) {
		console.log("ERROR", error);
	}
});

/**
 * Delete item by id request - delete item
 * @name delete/:id
 * @type DELETE
 */
app.delete("/delete/:id", async (req, res) => {
	const id = req.params.id;

	try {
		await db.execute(`DELETE FROM products WHERE id=("${id}");`);
		res.send("");
	} catch (error) {
		console.log("ERROR", error);
	}
});

app.listen(PORT, () => {
	console.log(
		`==================App listening on port ${PORT}!==================`
	);
});
