//PARA: visualizer (a constructed object)
function main(visualizer) {
	var audioContext = new webkitAudioContext();
	var xhr = new XMLHttpRequest();

	window.thingy = audioContext;

	var analyser = null; //audioContext.createAnalyser();
	var sourceNode = null; //audioContext.createBufferSource();
	var soundBuffer = null;
	var timerNode = null;
	window.framesAnalysed = 0;
	window.framesData = [];
	window.viz = visualizer;

	var BUFFER_SIZE = 2048;
	var MIDDLE_C_SCALE_MP3 = "sounds/middleCScale48khz.mp3";

	var soundUrl = MIDDLE_C_SCALE_MP3;

	function startRender(data, timeGap) {
		console.log("Started rendering");
		var index = 0;
		function renderFrame() {
			if (!data[index]) {
				return;
			}
			console.log("Rendering " + index);
			visualizer.clear();
			visualizer.render(data[index]);
			index += 1;
			setTimeout(renderFrame, timeGap);
		}
		renderFrame();
	}

	function renderOneFrame(data) {
		console.log("Rendering");
		visualizer.clear();
		visualizer.render(data);
	}

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

		// startRender(window.framesData, 100);
	}

	function startAudio() {
		sourceNode.noteOn(0);
		setTimeout(stopProcessing, soundBuffer.duration * 1000.0);
		console.log("Started playing with length " + soundBuffer.duration);
	}

	function analyseAudio() {
		var freqByteData = new Uint8Array(analyser.frequencyBinCount);
		//var freqByteData = new Float32Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(freqByteData);
		//analyser.getFloatFrequencyData(freqByteData);
		window.framesData.push(freqByteData);
		renderOneFrame(freqByteData);
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
		analyser.fftSize = BUFFER_SIZE;
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