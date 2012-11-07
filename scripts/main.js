require(
	["app"],
	function (app) {
		console.log("In main");
		window.onload = function () {
			console.log("Got window.onload");
			var MIDDLE_C_SCALE_MP3 = "sounds/middleCScale48khz.mp3";
			var SCHUMANN_LOTUS_FLOWER_MP3 = "/schumannLotusFlower.mp3";
			var ADJUSTED_MIDDLE_C_SCALE_MP3 = "http://localhost/adjustedMiddleCScale.mp3";
			var MOZART1_WAV = "/mozart1.wav";

			var config = {
				canvasElementId: "visCanvas",
				soundUrl: MOZART1_WAV
			};
			app(config);
		};
		window.onload();
	}
);
