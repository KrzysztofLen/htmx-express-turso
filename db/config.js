const { createClient } = require("@libsql/client");

const client = createClient({
	url: "<YOUR_DB_URL>",
	authToken: "<YOUR_DB_TOKEN>",
});

module.exports = client;
