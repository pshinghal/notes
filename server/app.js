/*global require:true, exports:true */
var express = require('express');
var app = express();
var add = require('./add');
app.use(express.bodyParser());
app.get("/", function (req, res) {
	res.send("Hello, world!");
});
app.post("/add", function (req, res) {
	console.log("Got request with params:");
	console.log(JSON.stringify(req.body));
	add.addToDb(
		req.body.markovModel,
		req.body.composer,
		req.body.type,
		function (err, result) {
			if (err) {
				console.log("Got error!");
				console.log(err);
				res.send(err);
			} else {
				console.log("Result:");
				console.log(result);
				res.send(result);
			}
		}
	);
});
app.listen(7070);