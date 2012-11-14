var mongoose = require("mongoose");
var mySchema = require('./schema');
var comparers = require('./comparers');

var mongo = mongoose.createConnection("localhost", "notes");
var PieceModel = mongo.model("piece", mySchema.Piece);
var ComposerModel = mongo.model("composer", mySchema.Composer);

var MODEL_ORDER = 2;

function getSimilar(mm, cb) {
	function resultComparer(a, b) {
		return b.similarity - a.similarity;
		//Highest similarity first
	}
	var inputModel = JSON.parse(mm)[MODEL_ORDER];
	var pieceResults = [];
	var composerResults = [];
	var allResults = {};
	function runComposerFind() {
		ComposerModel.find().exec(function (err, composerEntries) {
			if (err) {
				cb(err);
			}
			var i, composerEntry, comparedModel, similarity;
			console.log(composerEntries);
			for (i = 0; i < composerEntries.length; i += 1) {
				composerEntry = composerEntries[i];
				comparedModel = JSON.parse(composerEntry.markovModel)[MODEL_ORDER];
				similarity = comparers.compareTwo(inputModel, comparedModel);
				composerResults.push({
					similarity: similarity,
					composer: composerEntry.composer,
					type: composerEntry.type
				});
			}
			composerResults.sort(resultComparer);
			allResults.byComposer = composerResults;
			cb(null, allResults);
		});
	}
	PieceModel.find().exec(function (err, pieceEntries) {
		if (err) {
			cb(err);
		}
		var i, pieceEntry, comparedModel, similarity;
		console.log(pieceEntries);
		for (i = 0; i < pieceEntries.length; i += 1) {
			pieceEntry = pieceEntries[i];
			comparedModel = JSON.parse(pieceEntry.markovModel)[MODEL_ORDER];
			similarity = comparers.compareTwo(inputModel, comparedModel);
			pieceResults.push({
				similarity: similarity,
				piece: pieceEntry.piece,
				composer: pieceEntry.composer,
				type: pieceEntry.type
			});
		}
		pieceResults.sort(resultComparer);
		allResults.byPiece = pieceResults;
		runComposerFind();
	});
}

exports.getSimilar = getSimilar;