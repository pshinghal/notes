var mongoose = require("mongoose");

var PieceSchema = new mongoose.Schema({
	markovModel: String,
	piece: String,
	composer: String,
	type: String
});

var ComposerSchema = new mongoose.Schema({
	markovModel: String,
	composer: String,
	type: String
});

var TypeSchema = new mongoose.Schema({
	markovModel: String,
	type: String
});

exports.Piece = PieceSchema;
exports.Composer = ComposerSchema;
exports.Type = TypeSchema;