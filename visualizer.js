function createVisualizer(canvasId) {
	var visInterface = {};

	var canvas = document.getElementById(canvasId);
	var ctx = canvas.getContext("2d");

	var canvasWidth = 1024;
	var canvasHeight = 256;
	var barWidth = 3;
	var maxBarHeight = 255;

	var colors = [];
	colors.push("rgb(0, 46, 184)");
	colors.push("rgb(245, 184, 0)");
	//colors.push("rgb(255, 255, 0)");
	//colors.push("rgb(0, 0, 255)");

	visInterface.clear = function () {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	};

	visInterface.render = function (byteArray) {
		var i, height;
		for (i = 0; i < byteArray.length; i += 1) {
			height = 255 + byteArray[i];
			ctx.fillStyle = colors[i % colors.length];
			ctx.fillRect(i * barWidth, canvasHeight - height, barWidth, height);
			//ctx.fillRect(i, canvasHeight - byteArray[i], barWidth, 1);
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
