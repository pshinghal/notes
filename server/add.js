var mongoose = require("mongoose");
var _ = require("underscore");
var mySchema = require('./schema');

var mongo = mongoose.createConnection("localhost", "notes");

// var MARKOV_MODEL = "{0:{0:1}}";
// var COMPOSER = "Pallav";
// var TYPE = "Test";

var PieceModel = mongo.model("piece", mySchema.Piece);
console.log("Created schema and model");

function addToDb(mm, piece, comp, type, cb) {
	PieceModel.create({
		markovModel: mm,
		piece: piece,
		composer: comp,
		type: type
	}, cb);
}

mongo.once("open", function () {
	console.log("Connection opened");
	exports.addToDb = addToDb;
	console.log("Exported addToDb");
});