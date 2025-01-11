let audioContext;
let sound1, sound2;
let gainA, gainB, gainMaster, panA, panB;
let loopPlaying1 = false, loopPlaying2 = false;
let timeoutID1, timeoutID2;

let tempoMultiplier = 1;
let rateMultiplier = 1;
let currentPatternIndex = 0;
let syncActive = false;

let xhabarabotActive = false;
let scrambleTimeoutID1, scrambleTimeoutID2;
let scrambleFrequency = 1000;

const rhythmPatterns = {
    'Default Pattern': { loopA: [1, 0, 1, 0], loopB: [0, 1, 0, 1] },
    'Syncopated': { loopA: [1, 0, 0, 1, 0, 1, 0, 0], loopB: [0, 0, 1, 0, 1, 0, 0, 1] },
    'Polyrhythm': { loopA: [1, 0, 1, 0, 0, 1], loopB: [0, 1, 0, 1, 1, 0] },
    'Triplet': { loopA: [1, 0, 1, 0, 1], loopB: [0, 1, 0, 1, 0] },
    'Complex': { loopA: [1, 0, 1, 1, 0, 1, 0, 0], loopB: [0, 1, 0, 0, 1, 0, 1, 1] },
    'African 12/8': { loopA: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], loopB: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] },
    'Indian Teental': { loopA: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], loopB: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1] },
    'Balkan 7/8': { loopA: [1, 0, 1, 0, 1, 0, 1], loopB: [0, 1, 0, 1, 0, 1, 0] },
    'Brazilian': { loopA: [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0], loopB: [0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1] },
    'Minimal': { loopA: [1], loopB: [1] }
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
    'Pentatonic': {
        'a': 1.0, 'b': 9/8, 'c': 5/4, 'd': 3/2, 'e': 2.0, 'f': 10/8, 'g': 9/4,
        'h': 5/2, 'i': 3.0, 'j': 4.0, 'k': 0.5, 'l': 9/16, 'm': 5/8, 'n': 3/4,
        'o': 1.0, 'p': 0.25, 'q': 9/32, 'r': 5/16, 's': 3/8, 't': 0.5,
        'u': 4.0, 'v': 9/2, 'w': 5.0, 'x': 6.0, 'y': 8.0, 'z': 10.0, ' ': 0
    },
    'Japanese Hirajoshi': {
        'a': 1.0, 'b': 9/8, 'c': 5/4, 'd': 11/8, 'e': 3/2, 'f': 5/3, 'g': 2.0,
        'h': 9/4, 'i': 5/2, 'j': 11/4, 'k': 0.5, 'l': 9/16, 'm': 5/8, 'n': 11/16,
        'o': 3/4, 'p': 0.25, 'q': 9/32, 'r': 5/16, 's': 11/32, 't': 3/8,
        'u': 4.0, 'v': 9/2, 'w': 5.0, 'x': 11/2, 'y': 6.0, 'z': 8.0, ' ': 0
    },
    'Arabic Maqam': {
        'a': 1.0, 'b': 9/8, 'c': 75/64, 'd': 4/3, 'e': 3/2, 'f': 8/5, 'g': 15/8,
        'h': 2.0, 'i': 9/4, 'j': 75/32, 'k': 0.5, 'l': 9/16, 'm': 75/128, 'n': 2/3,
        'o': 3/4, 'p': 0.25, 'q': 9/32, 'r': 75/256, 's': 1/3, 't': 3/8,
        'u': 4.0, 'v': 9/2, 'w': 75/16, 'x': 8/3, 'y': 3.0, 'z': 15/4, ' ': 0
    },
    'Indian Bhairav': {
        'a': 1.0, 'b': 16/15, 'c': 5/4, 'd': 4/3, 'e': 3/2, 'f': 8/5, 'g': 15/8,
        'h': 2.0, 'i': 32/15, 'j': 5/2, 'k': 0.5, 'l': 8/15, 'm': 5/8, 'n': 2/3,
        'o': 3/4, 'p': 0.25, 'q': 16/60, 'r': 5/16, 's': 1/3, 't': 3/8,
        'u': 4.0, 'v': 64/15, 'w': 5.0, 'x': 8/3, 'y': 3.0, 'z': 15/4, ' ': 0
    },
    'Gamelan Pelog': {
        'a': 1.0, 'b': 1.111, 'c': 1.248, 'd': 1.462, 'e': 1.667, 'f': 1.889, 'g': 2.0,
        'h': 2.222, 'i': 2.496, 'j': 2.924, 'k': 0.5, 'l': 0.556, 'm': 0.624, 'n': 0.731,
        'o': 0.834, 'p': 0.25, 'q': 0.278, 'r': 0.312, 's': 0.366, 't': 0.417,
        'u': 4.0, 'v': 4.444, 'w': 4.992, 'x': 5.848, 'y': 6.668, 'z': 8.0, ' ': 0
    },
    'African Rhythmic': {
        'a': 1.0, 'b': 1.125, 'c': 1.25, 'd': 1.333, 'e': 1.5, 'f': 1.667, 'g': 1.875,
        'h': 2.0, 'i': 2.25, 'j': 2.5, 'k': 0.5, 'l': 0.563, 'm': 0.625, 'n': 0.667,
        'o': 0.75, 'p': 0.25, 'q': 0.281, 'r': 0.313, 's': 0.333, 't': 0.375,
        'u': 4.0, 'v': 4.5, 'w': 5.0, 'x': 5.333, 'y': 6.0, 'z': 8.0, ' ': 0
    }
};
};

let activePattern = 'Default Pattern';
let activeScale = 'Major';

function setupXhabarabotMode() {
    const xhabarabotButton = document.getElementById('xhabarabotButton');
    const scrambleFrequencySlider = document.getElementById('scrambleFrequencySlider');

    scrambleFrequencySlider.addEventListener('input', () => {
        scrambleFrequency = parseInt(scrambleFrequencySlider.value, 10);
        console.log(`Scramble frequency set to: ${scrambleFrequency}ms`);
        
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

    // Skip spaces with proper timing
    if (currentChar === ' ') {
        const interval = (60000 / (120 * tempoMultiplier)) * pattern[patternIndex];
        timeoutID1 = setTimeout(() => {
            currentPatternIndex++;
            playLoop1();
        }, interval);
        return;
    }

    // Only play sound if pattern has a beat at this position
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
        if (!syncActive || !loopPlaying2) {
            currentPatternIndex++;
        }
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

    // Skip spaces with proper timing
    if (currentChar === ' ') {
        const interval = (60000 / (120 * tempoMultiplier)) * pattern[patternIndex];
        timeoutID2 = setTimeout(() => {
            currentPatternIndex++;
            playLoop2();
        }, interval);
        return;
    }

    // Only play sound if pattern has a beat at this position
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
        if (syncActive && loopPlaying1) {
            // Let Loop A control the pattern index
        } else {
            currentPatternIndex++;
        }
        playLoop2();
    }, interval);
}

function setupEventListeners() {
    document.getElementById('loopButton1').addEventListener('click', () => {
        loopPlaying1 = !loopPlaying1;
        const loopButton1 = document.getElementById('loopButton1');
        if (loopPlaying1) {
            if (syncActive) currentPatternIndex = 0;
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
            if (syncActive) currentPatternIndex = 0;
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
            // Reset both loops to start fresh
            const baseInterval = 60000 / (120 * tempoMultiplier);
            const lettersInput1 = document.getElementById('lettersInput1').value;
            const lettersInput2 = document.getElementById('lettersInput2').value;
            
            // Only proceed if we have both loops playing and letters input
            if (loopPlaying1 && loopPlaying2 && lettersInput1 && lettersInput2) {
                // Stop current playback
                clearTimeout(timeoutID1);
                clearTimeout(timeoutID2);
                
                // Calculate pattern cycle lengths
                const pattern = rhythmPatterns[activePattern];
                const cycleLength = Math.max(
                    pattern.loopA.length * lettersInput1.length,
                    pattern.loopB.length * lettersInput2.length
                );
                
                // Reset pattern index at a musically appropriate point
                currentPatternIndex = 0;
                
                // Restart both loops with proper timing
                const startTime = audioContext.currentTime + 0.1; // Small delay for scheduling
                
                if (loopPlaying1) {
                    setTimeout(() => {
                        playLoop1();
                    }, 100);
                }
                
                if (loopPlaying2) {
                    setTimeout(() => {
                        playLoop2();
                    }, 100);
                }
            }
        }
    });
    
    // Helper function to calculate LCM
    function calculateLCM(a, b) {
        return Math.abs((a * b) / calculateGCD(a, b));
    }
    
    function calculateGCD(a, b) {
        return b === 0 ? a : calculateGCD(b, a % b);
    }
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
        console.log(`Scale set to: ${activeScale}`);
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
        console.log(`Rhythm pattern set to: ${activePattern}`);
        if (syncActive) {
            currentPatternIndex = 0;
            if (loopPlaying1 && loopPlaying2) {
                clearTimeout(timeoutID1);
                clearTimeout(timeoutID2);
                playLoop1();
                playLoop2();
            }
        }
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

async function recordStem(stream, stemName, duration) {
    return new Promise((resolve) => {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const chunks = [];

        mediaRecorder.addEventListener('dataavailable', (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        });

        mediaRecorder.addEventListener('stop', async () => {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            const wavBlob = await convertToWav(audioBlob);
            downloadBlob(wavBlob, `${stemName}_${new Date().toISOString()}.wav`);
            resolve();
        });

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), duration);
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
