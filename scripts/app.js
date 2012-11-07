/*global define:true, webkitAudioContext:true */
define(
	["visualization", "noteConverter"],
	function (visualization, noteConverter) {
		console.log("In app");
		return function (config) {
			console.log("Started App");
			var BUFFER_SIZE = 2048;
			// The concept of SAMPLES_TO_NOTE may be flawed.
			// Actually I'm fairly certain it IS flawed
			// Revise in next iteration.
			var SAMPLES_TO_NOTE = 8;

			var audioContext = new webkitAudioContext();
			var xhr = new XMLHttpRequest();
			var visualizer = visualization.createVisualizer(config);

			//TODO: Remove these
			window.thingy = audioContext;
			window.framesAnalysed = 0;
			window.framesData = [];
			window.viz = visualizer;

			var analyser = null; //audioContext.createAnalyser();
			var sourceNode = null; //audioContext.createBufferSource();
			var soundBuffer = null;
			var timerNode = null;

			var sampleArray = [];
			window.samples = sampleArray;

			function executeSlidingWindow(inputArray, windowSize, func) {
				var i, j, windowArray;
				for (i = windowSize - 1; i < inputArray.length; i += 1) {
					windowArray = [];
					for (j = windowSize - 1; j >= 0; j -= 1) {
						windowArray.push(inputArray[i - j]);
					}
					console.log("Created windowArray " + JSON.stringify(windowArray));
					func(windowArray);
				}
			}

			function getProbabilityModel(jumpArray) {
				// Representative of an octave in noteIndexes:
				var NUM_NOTES = 13;
				var MIN_JUMP = 1 - NUM_NOTES;
				var MAX_JUMP = NUM_NOTES - 1;
				var TOTAL_JUMPS = MAX_JUMP - MIN_JUMP + 1;
				var WINDOW_SIZE = 4;
				var INDEX_LENGTH = 3;
				window.markovModel = {};

				function reduceIndex(indexArray, num) {
					var i, currNum = 0;
					for (i = 0; i < indexArray.length && i < num; i += 1) {
						currNum *= TOTAL_JUMPS;
						currNum += indexArray[i] - MIN_JUMP;
					}
					return currNum;
				}

				function updateModelWithWindow(windowArray) {
					var index = reduceIndex(windowArray, INDEX_LENGTH);
					if (!window.markovModel[index]) {
						window.markovModel[index] = {};
					}
					if (!window.markovModel[index][windowArray[INDEX_LENGTH]]) {
						window.markovModel[index][windowArray[INDEX_LENGTH]] = 0;
					}
					console.log("Updating index " + index + ", subIndex " + INDEX_LENGTH + " of " + JSON.stringify(windowArray));
					window.markovModel[index][windowArray[INDEX_LENGTH]] += 1;
				}

				executeSlidingWindow(jumpArray, 4, updateModelWithWindow);
				console.log("Model created!");
			}

			function notesToJumps(noteArray) {
				var jumpArray = [];
				// Representative of an octave in noteIndexes:
				var NUM_NOTES = 13;
				var i;
				var diff;
				// Start with the second note
				for (i = 1; i < noteArray.length; i += 1) {
					diff = (noteArray[i] - noteArray[i - 1]) % NUM_NOTES;
					jumpArray.push(diff);
				}
				return jumpArray;
			}

			// MODIFIES 'set'
			function getMode(set) {
				var currNum, count, i;
				var maxNum = -Infinity;
				var maxCount = -1;
				set.sort();
				for (i = 0; i < set.length; i += 1) {
					currNum = set[i];
					count = 0;
					while (set[i] && set[i] === currNum) {
						i += 1;
						count += 1;
					}
					if (count > maxCount) {
						maxCount = count;
						maxNum = currNum;
					}
				}
				return maxNum;
			}

			function samplesToNotes(sampleArray) {
				console.log("Converting samples to notes");
				var noteArray = [];
				var i, sampleSet = [], currNote;
				for (i = 0; i < sampleArray.length; i += SAMPLES_TO_NOTE) {
					sampleSet = sampleArray.splice(0, SAMPLES_TO_NOTE);
					currNote = getMode(sampleSet);
					noteArray.push(currNote);
				}
				window.notes = noteArray;
				return noteArray;
			}

			function startModelMaking() {
				console.log("Started making model");
				var noteArray = samplesToNotes(sampleArray);
				console.log("Got note array:");
				console.log(noteArray);
				var jumpArray = notesToJumps(noteArray);
				console.log("Got jump array:");
				console.log(jumpArray);
				getProbabilityModel(jumpArray);
			}

			// # The frequency bin contains negative floats
			function getProperValueFromBin(binValue) {
				return 255 + binValue;
			}

			// # Renders a collection of data samples over time
			function startRender(data, timeGap) {
				console.log("Started rendering");
				var index = 0;
				function renderFrame() {
					if (!data[index]) {
						return;
					}
					// console.log("Rendering " + index);
					visualizer.clear();
					visualizer.render(data[index]);
					index += 1;
					setTimeout(renderFrame, timeGap);
				}
				renderFrame();
			}

			// # Renders one data sample
			function renderOneFrame(data, noteIndex) {
				// console.log("Rendering");
				var noteName = noteConverter.noteIndexToName(noteIndex);
				visualizer.clear();
				visualizer.render(data, noteName);
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

				startModelMaking();
			}

			function startAudio() {
				sourceNode.noteOn(0);
				setTimeout(stopProcessing, soundBuffer.duration * 1000.0);
				console.log("Started playing with length " + soundBuffer.duration);
			}

			function analyseAudio() {
				//var freqByteData = new Uint8Array(analyser.frequencyBinCount);
				var freqFloatData = new Float32Array(analyser.frequencyBinCount);
				var i, noteIndex;
				//analyser.getByteFrequencyData(freqByteData);
				analyser.getFloatFrequencyData(freqFloatData);
				for (i = 0; i < freqFloatData.length; i += 1) {
					freqFloatData[i] = getProperValueFromBin(freqFloatData[i]);
				}
				window.framesData.push(freqFloatData);
				noteIndex = noteConverter.dataSampleToNoteIndex(freqFloatData);
				sampleArray.push(noteIndex);
				renderOneFrame(freqFloatData, noteIndex);
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
				analyser.fftSize = 2048;
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
				xhr.open("GET", config.soundUrl, true);
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
		};
	}
);