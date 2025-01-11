let audioContext;
let sound1, sound2;
let gainA, gainB, gainMaster, panA, panB;
let loopPlaying1 = false, loopPlaying2 = false;
let timeoutID1, timeoutID2;

let tempoMultiplier = 1;
let rateMultiplier = 1;
let currentPatternIndex = 0;

let xhabarabotActive = false;
let scrambleTimeoutID1, scrambleTimeoutID2;
let scrambleFrequency = 1000;

const rhythmPatterns = {
    'Default': { 
        loopA: [1, 0, 1, 0], 
        loopB: [0, 1, 0, 1] 
    },
    'Pattern 1': { 
        loopA: [1, 0, 0, 1, 0, 0], 
        loopB: [0, 0, 1, 0, 0, 1] 
    },
    'Pattern 2': { 
        loopA: [1, 0, 0, 1, 0, 1, 0, 0], 
        loopB: [0, 1, 0, 0, 1, 0, 1, 0] 
    },
    'Pattern 3': { 
        loopA: [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1], 
        loopB: [0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0] 
    },
    'Pattern 4': { 
        loopA: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0], 
        loopB: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1] 
    },
    'Pattern 5': {
        loopA: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
        loopB: [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1]
    },
    'Pattern 6': {
        loopA: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        loopB: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0]
    },
    'Pattern 7': {
        loopA: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        loopB: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    },
    '12/8': { 
        loopA: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 
        loopB: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1] 
    },
    '7/8': { 
        loopA: [1, 0, 1, 0, 1, 0, 0], 
        loopB: [0, 1, 0, 1, 0, 0, 1] 
    },
    'Minimal': { 
        loopA: [1], 
        loopB: [1] 
    }
};

const scales = {
    'Major': {
        'a': 1.0, 'b': 9/8, 'c': 5/4, 'd': 3/2, 'e': 5/3, 'f': 2.0, 'g': 9/4,
        'h': 5/2, 'i': 3.0, 'j': 10/3, 'k': 0.5, 'l': 9/16, 'm': 5/8, 'n': 3/4,
        'o': 5/6, 'p': 0.25, 'q': 9/32, 'r': 5/16, 's': 3/8, 't': 5/12,
        'u': 4.0, 'v': 9/2, 'w': 5.0, 'x': 6.0, 'y': 20/3, 'z': 8.0, ' ': 0
    },
    'Minor': {
        'a': 1.0, 'b': 9/8, 'c': 6/5, 'd': 3/2, 'e': 8/5, 'f': 2.0, 'g': 9/4,
        'h': 12/5, 'i': 3.0, 'j': 16/5, 'k': 0.5, 'l': 9/16, 'm': 3/5, 'n': 3/4,
        'o': 4/5, 'p': 0.25, 'q': 9/32, 'r': 3/10, 's': 3/8, 't': 2/5,
        'u': 4.0, 'v': 9/2, 'w': 24/5, 'x': 6.0, 'y': 32/5, 'z': 8.0, ' ': 0
    },
    'Pelog': {
        'a': 1.0, 'b': 1.15, 'c': 1.3, 'd': 1.5, 'e': 1.65, 'f': 1.9, 'g': 2.0,
        'h': 2.15, 'i': 2.3, 'j': 2.5, 'k': 0.5, 'l': 0.575, 'm': 0.65, 'n': 0.75,
        'o': 0.825, 'p': 0.25, 'q': 0.2875, 'r': 0.325, 's': 0.375, 't': 0.4125,
        'u': 4.0, 'v': 4.3, 'w': 4.6, 'x': 5.0, 'y': 5.3, 'z': 6.0, ' ': 0
    },
    'Slendro': {
        'a': 1.0, 'b': 1.15, 'c': 1.33, 'd': 1.53, 'e': 1.76, 'f': 2.0, 'g': 2.3,
        'h': 2.66, 'i': 3.06, 'j': 3.52, 'k': 0.5, 'l': 0.575, 'm': 0.665, 'n': 0.765,
        'o': 0.88, 'p': 0.25, 'q': 0.2875, 'r': 0.3325, 's': 0.3825, 't': 0.44,
        'u': 4.0, 'v': 4.6, 'w': 5.32, 'x': 6.12, 'y': 7.04, 'z': 8.0, ' ': 0
    },
    'Raga Bhairav': {
        'a': 1.0, 'b': 16/15, 'c': 5/4, 'd': 4/3, 'e': 3/2, 'f': 8/5, 'g': 15/8,
        'h': 2.0, 'i': 32/15, 'j': 5/2, 'k': 0.5, 'l': 8/15, 'm': 5/8, 'n': 2/3,
        'o': 3/4, 'p': 0.25, 'q': 4/15, 'r': 5/16, 's': 1/3, 't': 3/8,
        'u': 4.0, 'v': 64/15, 'w': 5.0, 'x': 8/3, 'y': 3.0, 'z': 7.5, ' ': 0
    },
    'Raga Yaman': {
        'a': 1.0, 'b': 9/8, 'c': 5/4, 'd': 45/32, 'e': 3/2, 'f': 27/16, 'g': 15/8,
        'h': 2.0, 'i': 9/4, 'j': 5/2, 'k': 0.5, 'l': 9/16, 'm': 5/8, 'n': 45/64,
        'o': 3/4, 'p': 0.25, 'q': 9/32, 'r': 5/16, 's': 45/128, 't': 3/8,
        'u': 4.0, 'v': 9/2, 'w': 5.0, 'x': 45/8, 'y': 6.0, 'z': 15/2, ' ': 0
    },
    'Arabic Maqam Bayati': {
        'a': 1.0, 'b': 1.125, 'c': 1.35, 'd': 1.5, 'e': 1.7, 'f': 2.0, 'g': 2.25,
        'h': 2.7, 'i': 3.0, 'j': 3.4, 'k': 0.5, 'l': 0.5625, 'm': 0.675, 'n': 0.75,
        'o': 0.85, 'p': 0.25, 'q': 0.28125, 'r': 0.3375, 's': 0.375, 't': 0.425,
        'u': 4.0, 'v': 4.5, 'w': 5.4, 'x': 6.0, 'y': 6.8, 'z': 8.0, ' ': 0
    },
    'Persian Dastgah Shur': {
        'a': 1.0, 'b': 1.11, 'c': 1.25, 'd': 1.33, 'e': 1.5, 'f': 1.66, 'g': 1.87,
        'h': 2.0, 'i': 2.22, 'j': 2.5, 'k': 0.5, 'l': 0.555, 'm': 0.625, 'n': 0.665,
        'o': 0.75, 'p': 0.25, 'q': 0.2775, 'r': 0.3125, 's': 0.3325, 't': 0.375,
        'u': 4.0, 'v': 4.44, 'w': 5.0, 'x': 5.32, 'y': 6.0, 'z': 7.48, ' ': 0
    },
    'Chinese Gong': {
        'a': 1.0, 'b': 9/8, 'c': 81/64, 'd': 3/2, 'e': 27/16, 'f': 2.0, 'g': 9/4,
        'h': 81/32, 'i': 3.0, 'j': 27/8, 'k': 0.5, 'l': 9/16, 'm': 81/128, 'n': 3/4,
        'o': 27/32, 'p': 0.25, 'q': 9/32, 'r': 81/256, 's': 3/8, 't': 27/64,
        'u': 4.0, 'v': 9/2, 'w': 81/16, 'x': 6.0, 'y': 27/4, 'z': 8.0, ' ': 0
    },
    'Japanese Hirajoshi': {
        'a': 1.0, 'b': 1.125, 'c': 1.333, 'd': 1.5, 'e': 1.875, 'f': 2.0, 'g': 2.25,
        'h': 2.666, 'i': 3.0, 'j': 3.75, 'k': 0.5, 'l': 0.5625, 'm': 0.6665, 'n': 0.75,
        'o': 0.9375, 'p': 0.25, 'q': 0.28125, 'r': 0.33325, 's': 0.375, 't': 0.46875,
        'u': 4.0, 'v': 4.5, 'w': 5.332, 'x': 6.0, 'y': 7.5, 'z': 8.0, ' ': 0
    }
};

let activePattern = 'Simple';
let activeScale = 'Major';

function setupXhabarabotMode() {
    const xhabarabotButton = document.getElementById('xhabarabotButton');
    const scrambleFrequencySlider = document.getElementById('scrambleFrequencySlider');

    scrambleFrequencySlider.addEventListener('input', () => {
        scrambleFrequency = parseInt(scrambleFrequencySlider.value, 10);
        if (xhabarabotActive) {
            stopScrambling();
            startScrambling();
        }
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
        if (loopPlaying1) currentPatternIndex = 0;
    }, scrambleFrequency);

    scrambleTimeoutID2 = setInterval(() => {
        scrambleLetters2();
        if (loopPlaying2) currentPatternIndex = 0;
    }, scrambleFrequency);
}

function stopScrambling() {
    clearInterval(scrambleTimeoutID1);
    clearInterval(scrambleTimeoutID2);
}

function scrambleLetters1() {
    const input = document.getElementById('lettersInput1');
    if (input) input.value = input.value.split('').sort(() => Math.random() - 0.5).join('');
}

function scrambleLetters2() {
    const input = document.getElementById('lettersInput2');
    if (input) input.value = input.value.split('').sort(() => Math.random() - 0.5).join('');
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

    setupScaleDropdown();
    setupPatternDropdown();
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

    const pattern = rhythmPatterns[activePattern].loopA;
    const patternIndex = currentPatternIndex % pattern.length;
    const letterIndex = Math.floor(currentPatternIndex / pattern.length) % input.length;
    const currentChar = input[letterIndex];

    if (currentChar === ' ') {
        const interval = (60000 / (120 * tempoMultiplier)) * pattern[patternIndex];
        timeoutID1 = setTimeout(() => {
            currentPatternIndex++;
            playLoop1();
        }, interval);
        return;
    }

    if (pattern[patternIndex]) {
        const finalRate = (scales[activeScale][currentChar] || 1) * rateMultiplier;
        if (sound1 && finalRate > 0) {
            const source = audioContext.createBufferSource();
            source.buffer = sound1;
            source.playbackRate.value = finalRate;
            source.connect(gainA);
            source.start();
        }
    }

    const interval = (60000 / (120 * tempoMultiplier)) * pattern[patternIndex];
    timeoutID1 = setTimeout(() => {
        currentPatternIndex++;
        playLoop1();
    }, interval);
}

function playLoop2() {
    if (!loopPlaying2) return;

    const input = document.getElementById('lettersInput2').value.toLowerCase();
    if (!input) return;

    const pattern = rhythmPatterns[activePattern].loopB;
    const patternIndex = currentPatternIndex % pattern.length;
    const letterIndex = Math.floor(currentPatternIndex / pattern.length) % input.length;
    const currentChar = input[letterIndex];

    if (currentChar === ' ') {
        const interval = (60000 / (120 * tempoMultiplier)) * pattern[patternIndex];
        timeoutID2 = setTimeout(() => {
            currentPatternIndex++;
            playLoop2();
        }, interval);
        return;
    }

    if (pattern[patternIndex]) {
        const finalRate = (scales[activeScale][currentChar] || 1) * rateMultiplier;
        if (sound2 && finalRate > 0) {
            const source = audioContext.createBufferSource();
            source.buffer = sound2;
            source.playbackRate.value = finalRate;
            source.connect(gainB);
            source.start();
        }
    }

    const interval = (60000 / (120 * tempoMultiplier)) * pattern[patternIndex];
    timeoutID2 = setTimeout(() => {
        currentPatternIndex++;
        playLoop2();
    }, interval);
}

function setupEventListeners() {
    document.getElementById('loopButton1').addEventListener('click', () => {
        loopPlaying1 = !loopPlaying1;
        const loopButton1 = document.getElementById('loopButton1');
        if (loopPlaying1) {
            currentPatternIndex = 0;
            playLoop1();
            loopButton1.textContent = "STOP LOOP A";
            loopButton1.style.backgroundColor = "#FF0000";
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
            currentPatternIndex = 0;
            playLoop2();
            loopButton2.textContent = "STOP LOOP B";
            loopButton2.style.backgroundColor = "#FF0000";
        } else {
            clearTimeout(timeoutID2);
            loopButton2.textContent = "PLAY LOOP B";
            loopButton2.style.backgroundColor = "#111";
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
    });

    panSlider2.addEventListener('input', () => {
        panB.pan.value = parseFloat(panSlider2.value);
    });
}

function setupScaleDropdown() {
    const scaleSelect = document.getElementById('scaleSelect');
    for (const scaleName in scales) {
        const option = document.createElement('option');
        option.value = scaleName;
        option.textContent = scaleName;
        scaleSelect.appendChild(option);
    }
    scaleSelect.value = activeScale;
    scaleSelect.addEventListener('change', () => {
        activeScale = scaleSelect.value;
    });
}

function setupPatternDropdown() {
    const patternSelect = document.getElementById('patternSelect');
    for (const patternName in rhythmPatterns) {
        const option = document.createElement('option');
        option.value = patternName;
        option.textContent = patternName;
        patternSelect.appendChild(option);
    }
    patternSelect.value = activePattern;
    patternSelect.addEventListener('change', () => {
        activePattern = patternSelect.value;
        currentPatternIndex = 0;
    });
}

function setupRecording() {
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaStreamDestinationA = audioContext.createMediaStreamDestination();
    const mediaStreamDestinationB = audioContext.createMediaStreamDestination();

    gainMaster.connect(mediaStreamDestination);
    gainA.connect(mediaStreamDestinationA);
    gainB.connect(mediaStreamDestinationB);

    const saveButton = document.getElementById('saveButton');
    const saveStemsButton = document.getElementById('saveStemsButton');

    let mediaRecorder = null;
    let stemRecorderA = null;
    let stemRecorderB = null;
    let recordedChunks = [];
    let recordedChunksA = [];
    let recordedChunksB = [];
    let isRecordingStems = false;

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

    saveStemsButton.addEventListener('click', () => {
        if (!isRecordingStems) {
            // Start recording stems
            isRecordingStems = true;
            recordedChunksA = [];
            recordedChunksB = [];

            stemRecorderA = new MediaRecorder(mediaStreamDestinationA.stream, { mimeType: 'audio/webm' });
            stemRecorderB = new MediaRecorder(mediaStreamDestinationB.stream, { mimeType: 'audio/webm' });

            stemRecorderA.addEventListener('dataavailable', (e) => {
                if (e.data.size > 0) recordedChunksA.push(e.data);
            });

            stemRecorderB.addEventListener('dataavailable', (e) => {
                if (e.data.size > 0) recordedChunksB.push(e.data);
            });

            stemRecorderA.addEventListener('stop', async () => {
                const audioBlob = new Blob(recordedChunksA, { type: 'audio/webm' });
                const wavBlob = await convertToWav(audioBlob);
                downloadBlob(wavBlob, `stem_a_${new Date().toISOString()}.wav`);
            });

            stemRecorderB.addEventListener('stop', async () => {
                const audioBlob = new Blob(recordedChunksB, { type: 'audio/webm' });
                const wavBlob = await convertToWav(audioBlob);
                downloadBlob(wavBlob, `stem_b_${new Date().toISOString()}.wav`);
            });

            stemRecorderA.start();
            stemRecorderB.start();
            saveStemsButton.textContent = 'STOP STEM RECORDING';
            saveStemsButton.style.backgroundColor = '#FF0000';
        } else {
            // Stop recording stems
            stemRecorderA.stop();
            stemRecorderB.stop();
            isRecordingStems = false;
            saveStemsButton.textContent = 'RECORD STEMS';
            saveStemsButton.style.backgroundColor = '#FF851B';
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

function resetLoop(loopNumber) {
    if (loopNumber === 1) {
        const input = document.getElementById('lettersInput1');
        if (input) input.value = '';
    } else if (loopNumber === 2) {
        const input = document.getElementById('lettersInput2');
        if (input) input.value = '';
    }
    currentPatternIndex = 0;
}
