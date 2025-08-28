require("dotenv").config();
const createApp = require("./app/createApp");

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
