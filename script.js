let audioContext;
let sound1, sound2;
let gainA, gainB, gainMaster, panA, panB;
let loopPlaying1 = false, loopPlaying2 = false;
let timeoutID1, timeoutID2;

let tempoMultiplier = 1;
let rateMultiplier = 1;
let currentPatternIndex = 0;
let syncActive = false;

let xhabarabotActive = false; // Track Xhabarabot Mode state
let scrambleTimeoutID1, scrambleTimeoutID2;
let scrambleFrequency = 1000; 

const rhythmPatterns = {
    'Default Pattern': { loopA: [1, 0, 1, 0], loopB: [0, 1, 0, 1] },
    'Syncopated': { loopA: [1, 0, 0, 1, 0, 1, 0, 0], loopB: [0, 0, 1, 0, 1, 0, 0, 1] },
    'Polyrhythm': { loopA: [1, 0, 1, 0, 0, 1], loopB: [0, 1, 0, 1, 1, 0] },
    'Triplet': { loopA: [1, 0, 1, 0, 1], loopB: [0, 1, 0, 1, 0] },
};

let activePattern = 'Default Pattern';

const rateMapping = {
    'a': 1.0,       // Root (1st Octave)
    'b': 9 / 8,     // Major Second (1st Octave)
    'c': 5 / 4,     // Major Third (1st Octave)
    'd': 3 / 2,     // Perfect Fifth (1st Octave)
    'e': 5 / 3,     // Major Sixth (1st Octave)
    'f': 2.0,       // Root (2nd Octave)
    'g': 9 / 4,     // Major Second (2nd Octave)
    'h': 5 / 2,     // Major Third (2nd Octave)
    'i': 3.0,       // Perfect Fifth (2nd Octave)
    'j': 10 / 3,    // Major Sixth (2nd Octave)
    'k': 0.5,       // Root (Lower 1st Octave)
    'l': 9 / 16,    // Major Second (Lower 1st Octave)
    'm': 5 / 8,     // Major Third (Lower 1st Octave)
    'n': 3 / 4,     // Perfect Fifth (Lower 1st Octave)
    'o': 5 / 6,     // Major Sixth (Lower 1st Octave)
    'p': 0.25,      // Root (Lower 2nd Octave)
    'q': 9 / 32,    // Major Second (Lower 2nd Octave)
    'r': 5 / 16,    // Major Third (Lower 2nd Octave)
    's': 3 / 8,     // Perfect Fifth (Lower 2nd Octave)
    't': 5 / 12,    // Major Sixth (Lower 2nd Octave)
    'u': 4.0,       // Root (3rd Octave)
    'v': 9 / 2,     // Major Second (3rd Octave)
    'w': 5.0,       // Major Third (3rd Octave)
    'x': 6.0,       // Perfect Fifth (3rd Octave)
    'y': 20 / 3,    // Major Sixth (3rd Octave)
    'z': 8.0,       // Root (4th Octave)
    ' ': 0          // Space as a break/gap
};

function setupXhabarabotMode() {
    const xhabarabotButton = document.getElementById('xhabarabotButton');
    const scrambleFrequencySlider = document.getElementById('scrambleFrequencySlider');

    scrambleFrequencySlider.addEventListener('input', () => {
        scrambleFrequency = parseInt(scrambleFrequencySlider.value, 10);
        console.log(`Scramble frequency set to: ${scrambleFrequency}ms`);
    });

    xhabarabotButton.addEventListener('click', () => {
        xhabarabotActive = !xhabarabotActive;
        xhabarabotButton.textContent = xhabarabotActive ? 'STOP Xhabarabot Mode' : 'Xhabarabot Mode';
        xhabarabotButton.style.backgroundColor = xhabarabotActive ? '#FF0000' : '#111';

        if (xhabarabotActive) {
            startScrambling();
        } else {
            stopScrambling();
        }
    });
}

function startScrambling() {
    scrambleTimeoutID1 = setInterval(() => {
        scrambleLetters1();
        if (syncActive) currentPatternIndex = 0;
    }, scrambleFrequency);

    scrambleTimeoutID2 = setInterval(() => {
        scrambleLetters2();
        if (syncActive) currentPatternIndex = 0;
    }, scrambleFrequency);

    console.log('Xhabarabot Mode activated.');
}

function stopScrambling() {
    clearInterval(scrambleTimeoutID1);
    clearInterval(scrambleTimeoutID2);
    console.log('Xhabarabot Mode deactivated.');
}

function scrambleLetters1() {
    const input = document.getElementById('lettersInput1');
    if (input) input.value = input.value.split('').sort(() => Math.random() - 0.5).join('');
    console.log('Loop A scrambled.');
}

function scrambleLetters2() {
    const input = document.getElementById('lettersInput2');
    if (input) input.value = input.value.split('').sort(() => Math.random() - 0.5).join('');
    console.log('Loop B scrambled.');
}

document.addEventListener('DOMContentLoaded', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    gainA = audioContext.createGain();
    gainB = audioContext.createGain();
    gainMaster = audioContext.createGain();
    panA = audioContext.createStereoPanner();
    panB = audioContext.createStereoPanner();

    gainA.connect(panA);
    panA.connect(gainMaster);

    gainB.connect(panB);
    panB.connect(gainMaster);

    gainMaster.connect(audioContext.destination);

    gainA.gain.value = 0.4;
    gainB.gain.value = 0.4;
    gainMaster.gain.value = 0.5;

    setupRecording();
    setupEventListeners();
    setupFileUploads();
    setupPanSliders();
    setupXhabarabotMode();
});

function playLoop1() {
    if (!loopPlaying1) return;

    const input = document.getElementById('lettersInput1').value.toLowerCase();
    if (!input) return;

    const currentChar = input[currentPatternIndex % input.length];
    if (currentChar === ' ') {
        setTimeout(() => {
            currentPatternIndex++;
            playLoop1();
        }, 60000 / (120 * tempoMultiplier));
        return;
    }

    const finalRate = (rateMapping[currentChar] || 1) * rateMultiplier;

    if (sound1 && finalRate > 0) {
        const source = audioContext.createBufferSource();
        source.buffer = sound1;
        source.playbackRate.value = finalRate;
        source.connect(gainA);
        source.start();
    }

    const pattern = rhythmPatterns[activePattern].loopA;
    const interval = (60000 / (120 * tempoMultiplier)) * pattern[currentPatternIndex % pattern.length];

    timeoutID1 = setTimeout(playLoop1, interval);
    currentPatternIndex++;
}

function playLoop2() {
    if (!loopPlaying2) return;

    const input = document.getElementById('lettersInput2').value.toLowerCase();
    if (!input) return;

    const currentChar = input[currentPatternIndex % input.length];
    if (currentChar === ' ') {
        setTimeout(() => {
            currentPatternIndex++;
            playLoop2();
        }, 60000 / (120 * tempoMultiplier));
        return;
    }

    const finalRate = (rateMapping[currentChar] || 1) * rateMultiplier;

    if (sound2 && finalRate > 0) {
        const source = audioContext.createBufferSource();
        source.buffer = sound2;
        source.playbackRate.value = finalRate;
        source.connect(gainB);
        source.start();
    }

    const pattern = rhythmPatterns[activePattern].loopB;
    const interval = (60000 / (120 * tempoMultiplier)) * pattern[currentPatternIndex % pattern.length];

    timeoutID2 = setTimeout(playLoop2, interval);
    currentPatternIndex++;
}

function setupEventListeners() {
    document.getElementById('loopButton1').addEventListener('click', () => {
        loopPlaying1 = !loopPlaying1;
        const loopButton1 = document.getElementById('loopButton1');
        if (loopPlaying1) {
            playLoop1();
            loopButton1.textContent = "STOP LOOP A";
            loopButton1.style.backgroundColor = "#0F0";
        } else {
            clearTimeout(timeoutID1);
            loopButton1.textContent = "PLAY LOOP A";
            loopButton1.style.backgroundColor = "#111";
        }
    });

    document.getElementById('loopButton2').addEventListener('click', () => {
        loopPlaying2 = !loopPlaying2;
        const loopButton2 = document.getElementById('loopButton2');
        if (loopPlaying2) {
            playLoop2();
            loopButton2.textContent = "STOP LOOP B";
            loopButton2.style.backgroundColor = "#0F0";
        } else {
            clearTimeout(timeoutID2);
            loopButton2.textContent = "PLAY LOOP B";
            loopButton2.style.backgroundColor = "#111";
        }
    });

    document.getElementById('syncButton').addEventListener('click', () => {
        syncActive = !syncActive;
        const syncButton = document.getElementById('syncButton');
        syncButton.style.backgroundColor = syncActive ? "#0F0" : "#111";

        if (syncActive) {
            currentPatternIndex = 0;
        }
    });
}

function setupFileUploads() {
    document.getElementById('audioFileA').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            sound1 = await audioContext.decodeAudioData(arrayBuffer);
        }
    });

    document.getElementById('audioFileB').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            sound2 = await audioContext.decodeAudioData(arrayBuffer);
        }
    });
}

function setupPanSliders() {
    const panSlider1 = document.getElementById('panSlider1');
    const panSlider2 = document.getElementById('panSlider2');

    panSlider1.addEventListener('input', () => {
        panA.pan.value = parseFloat(panSlider1.value);
        console.log(`Pan A set to: ${panA.pan.value}`);
    });

    panSlider2.addEventListener('input', () => {
        panB.pan.value = parseFloat(panSlider2.value);
        console.log(`Pan B set to: ${panB.pan.value}`);
    });
}

function setupRecording() {
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    gainMaster.connect(mediaStreamDestination);

    const saveButton = document.getElementById('saveButton');
    const saveStemsButton = document.getElementById('saveStemsButton');

    let mediaRecorder = null;
    let recordedChunks = [];

    saveButton.addEventListener('click', () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, { mimeType: 'audio/webm' });

            mediaRecorder.addEventListener('dataavailable', (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            });

            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
                const wavBlob = await convertToWav(audioBlob);
                downloadBlob(wavBlob, `mix_${new Date().toISOString()}.wav`);
            });

            mediaRecorder.start();
            saveButton.textContent = 'STOP RECORDING';
            saveButton.style.backgroundColor = '#FF0000';
        } else {
            mediaRecorder.stop();
            saveButton.textContent = 'RECORD MIX';
            saveButton.style.backgroundColor = '#FF851B';
        }
    });
}

async function convertToWav(audioBlob) {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBufferToWav(audioBuffer);
}

function audioBufferToWav(buffer) {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const result = new DataView(new ArrayBuffer(length));
    let offset = 0;

    writeString(result, offset, 'RIFF'); offset += 4;
    result.setUint32(offset, length - 8, true); offset += 4;
    writeString(result, offset, 'WAVE'); offset += 4;
    writeString(result, offset, 'fmt '); offset += 4;
    result.setUint32(offset, 16, true); offset += 4;
    result.setUint16(offset, 1, true); offset += 2;
    result.setUint16(offset, numOfChannels, true); offset += 2;
    result.setUint32(offset, buffer.sampleRate, true); offset += 4;
    result.setUint32(offset, buffer.sampleRate * numOfChannels * 2, true); offset += 4;
    result.setUint16(offset, numOfChannels * 2, true); offset += 2;
    result.setUint16(offset, 16, true); offset += 2;
    writeString(result, offset, 'data'); offset += 4;
    result.setUint32(offset, length - offset - 4, true); offset += 4;

    const channels = [];
    for (let i = 0; i < numOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let pos = offset;
    for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < numOfChannels; j++) {
            const sample = Math.max(-1, Math.min(1, channels[j][i]));
            result.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
    }

    return new Blob([result], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
