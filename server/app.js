/*global require:true, exports:true */
var express = require('express');
var app = express();
var add = require('./add');
var search = require('./search');
app.use(express.bodyParser());
//app.get("/", function (req, res) {
//	res.send("Hello, world!");
//});
app.post("/add", function (req, res) {
	console.log("Got request with params:");
	console.log(req.body);
	add.addToDb(
		req.body.markovModel,
		req.body.piece,
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
				res.send(JSON.stringify(result));
			}
		}
	);
});

app.post("/search", function (req, res) {
	console.log("Received search request");
	console.log(req.body);
	search.getSimilar(req.body.markovModel, function (err, result) {
		if (err) {
			console.log("Got error!");
			console.log(err);
			res.end(err);
		} else {
			console.log("Result:");
			console.log(result);
			res.send(JSON.stringify(result));
		}
	});
});
app.use("/", express.static("../"));
app.listen(7070);