// ## comparers

var SIZE = 25;
function compareTwo(model1, model2) {
	var total = 0.0;
	var i, j;
	for (i in model1) {
		if (model1.hasOwnProperty(i) && model2.hasOwnProperty(i)) {
			for (j in model1[i]) {
				if (model1[i].hasOwnProperty(j) && model2[i].hasOwnProperty(j)) {
					total += model1[i][j] * model2[i][j];
				}
			}
		}
	}
	return total;
}

exports.compareTwo = compareTwo;