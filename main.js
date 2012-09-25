function main() {
	var audioContext = new webkitAudioContext();
	var xhr = new XMLHttpRequest();

	var analyser = null; //audioContext.createAnalyser();
	var sourceNode = null; //audioContext.createBufferSource();
	var soundBuffer = null;
	var timerNode = null;
	window.framesAnalysed = 0;
	window.framesData = [];

	var BUFFER_SIZE = 2048;
	var MIDDLE_C_SCALE_MP3 = "sounds/middleCScale.mp3";

	var soundUrl = MIDDLE_C_SCALE_MP3;

	function stopProcessing() {
		console.log("Stopping processes");
		sourceNode.noteOff(0);
		console.log("Set immediate noteOff");
		sourceNode.disconnect(0); //May need to disconnect once more, since two connections were made
		console.log("Disconnected source");
		timerNode.disconnect(0);
		console.log("Disconnected timer");
		analyser.disconnect();
		console.log("Disconnected analyser");
	}

	function startAudio() {
		sourceNode.noteOn(0);
		setTimeout(stopProcessing, soundBuffer.duration * 1000.0);
		console.log("Started playing with length " + soundBuffer.duration);
	}

	function analyseAudio() {
		var freqByteData = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(freqByteData);
		window.framesData.push(JSON.stringify(freqByteData));
		window.framesAnalysed += 1;
	}

	function buildArchitecture() {
		console.log("Building architecture");
		sourceNode = audioContext.createBufferSource();
		analyser = audioContext.createAnalyser();
		timerNode = audioContext.createJavaScriptNode(BUFFER_SIZE, 1, 1);

		sourceNode.buffer = soundBuffer;
		timerNode.onaudioprocess = analyseAudio;

		sourceNode.connect(analyser);
		sourceNode.connect(audioContext.destination);
		analyser.connect(timerNode);
		timerNode.connect(audioContext.destination);
		console.log("Architecture built");

		startAudio();
	}

	function decodeSuccess(decodedBuffer) {
		console.log("Audio data decoded into audio buffer");
		soundBuffer = decodedBuffer;

		buildArchitecture();
	}

	function decodeError() {
		console.log("ERROR: Audio data decoding failed!");
	}

	function createAudioBuffer(audioData) {
		console.log("Creating audio buffer");
		soundBuffer = audioContext.decodeAudioData(audioData, decodeSuccess, decodeError);
	}

	function getSoundFile() {
		xhr.open("GET", soundUrl, true);
		xhr.responseType = "arraybuffer";
		xhr.onerror = function (e) {
			console.log("ERROR: " + e);
		};
		xhr.onload = function () {
			console.log("Got a response of type " + typeof xhr.response);
			createAudioBuffer(xhr.response);
		};
		xhr.send();
	}

	getSoundFile();
}