require(
	["app"],
	function (app) {
		console.log("In main");
		window.onload = function () {
			console.log("Got window.onload");
			var MIDDLE_C_SCALE_MP3 = "/sounds/middleCScale48khz.mp3";
			var SCHUMANN_LOTUS_FLOWER_MP3 = "/sounds/schumannLotusFlower.mp3";
			var ADJUSTED_MIDDLE_C_SCALE_MP3 = "/sounds/adjustedMiddleCScale.mp3";
			var MOZART1_MP3 = "/sounds/mozart1.mp3";//Mozart Piano Sonata No. 16 Movement 1
			var MOZART2_MP3 = "/sounds/mozart2.mp3";//Rondo
			var MOZART3_MP3 = "/sounds/mozart3.mp3";//Mozart Piano Sonata No. 16 Movement 2
			var BACH1_MP3 = "/sounds/bach1.mp3";//Sonata in Bb Major
			var BACH2_MP3 = "/sounds/bach2.mp3";//Sonata in G Major
			var BACH3_MP3 = "/sounds/bach3.mp3";//Solfeggietto

			var config = {
				canvasElementId: "visCanvas",
				soundUrl: BACH2_MP3,
				searchUrl: "/search",
				addUrl: "/add"
			};
			app(config);
		};
		window.onload();
	}
);
