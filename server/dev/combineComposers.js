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

var mongo = mongoose.createConnection("localhost", "notes");
var PieceModel = mongo.model("piece", PieceSchema);
var ComposerModel = mongo.model("composer", ComposerSchema);

var COMPOSERS = ["Bach", "Mozart"];
var COMPOSER_TO_ERA = {
	"Bach": "Baroque",
	"Mozart": "Classical"
};

var i, composerResults;
function composerResultsCallback(err, composerEntries) {
	if (err) {
		console.log("Encountered error!");
		return;
	}
	if (!composerEntries) {
		return;
	}
	console.log(composerEntries.length);
	var currComposer = composerEntries[0].composer;
	console.log("Processing " +  currComposer);
	var currModel = {};
	var newModel = {};
	function addAllToNewModel(fromModel, order) {
		var i, j;
		if (!newModel.hasOwnProperty(order)) {
			newModel[order] = {};
		}
		for (i in fromModel) {
			if (fromModel.hasOwnProperty(i)) {
				if (!newModel[order].hasOwnProperty(i)) {
					newModel[order][i] = {};
				}
				for (j in fromModel[i]) {
					if (fromModel[i].hasOwnProperty(j)) {
						if (!newModel[order][i].hasOwnProperty(j)) {
							newModel[order][i][j] = 0;
						}
						newModel[order][i][j] += fromModel[i][j];
					}
				}
			}
		}
	}
	for (i = 0; i < composerEntries.length; i += 1) {
		currModel = JSON.parse(composerEntries[i].markovModel);
		console.log("Starting model creation");
		addAllToNewModel(currModel[2], 2);
		console.log("Created order 2 model");
		addAllToNewModel(currModel[3], 3);
		console.log("Created order 3 model");
		console.log("Created model");
	}
	ComposerModel.create({
		markovModel: JSON.stringify(newModel),
		composer: currComposer,
		type: COMPOSER_TO_ERA[currComposer]
	}, function (err, result) {
		if (err) {
			console.log("Got error!");
			console.log(err);
		} else {
			console.log("Got result:");
			console.log(result);
		}
	});
}

for (i = 0; i < COMPOSERS.length; i += 1) {
	PieceModel.find({composer: COMPOSERS[i]}).exec(composerResultsCallback);
}