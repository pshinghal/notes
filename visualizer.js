function createVisualizer(canvasId) {
	var visInterface = {};

	var canvas = document.getElementById(canvasId);
	var ctx = canvas.getContext("2d");

	var canvasWidth = 1024;
	var canvasHeight = 256;
	var barWidth = 1;
	var maxBarHeight = 255;

	visInterface.clear = function () {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	};

	visInterface.render = function (byteArray) {
		var i;
		for (i = 0; i < byteArray.length; i += 1) {
			ctx.fillRect(i, canvasHeight - byteArray[i], barWidth, byteArray[i]);
		}
	};

	//PARA: start (inclusive)
	//PARA: end (inclusive)
	visInterface.play = function (byteArrayArray, start, end, timeGap) {
		function playFrame(index) {
			if (index > end || !byteArrayArray[index]) {
				return;
			}
			console.log("Playing " + index);
			visInterface.clear();
			visInterface.render(byteArrayArray[index]);
			setTimeout(function () { playFrame(index + 1); }, timeGap);
		}
		playFrame(start);
		console.log("Started playing");
	};

	return visInterface;
}