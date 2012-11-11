var mongoose = require("mongoose");
var _ = require("underscore");

var mongo = mongoose.createConnection("localhost", "notes");

var MarkovSchema = new mongoose.Schema({
	markovModel: String,
	composer: String,
	type: String
});

// var MARKOV_MODEL = "{0:{0:1}}";
// var COMPOSER = "Pallav";
// var TYPE = "Test";

var MMModel = mongo.model("markov_model", MarkovSchema);
console.log("Created schema and model");

function addToDb(mm, comp, type, cb) {
	MMModel.create({
		markovModel: mm,
		composer: comp,
		type: type
	}, cb);
}

mongo.once("open", function () {
	console.log("Connection opened");
	exports.addToDb = addToDb;
	console.log("Exported addToDb");
});