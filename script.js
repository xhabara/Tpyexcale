let audioContext;
let sound1, sound2;
let gainA, gainB, gainMaster;
let loopPlaying1 = false, loopPlaying2 = false;
let timeoutID1, timeoutID2;
let currentPatternIndex = 0;
let tempoMultiplier = 1;
let rateMultiplier = 1;

const rhythmPatterns = {
    'Default Pattern': { loopA: [1, 0, 1, 0], loopB: [0, 1, 0, 1] },
    'Syncopated': { loopA: [1, 0, 0, 1, 0, 1, 0, 0], loopB: [0, 0, 1, 0, 1, 0, 0, 1] }
};

const scales = {
    'Major': { 'a': 1.0, 'b': 9/8, 'c': 5/4, 'd': 3/2, 'e': 5/3, 'f': 2.0, 'g': 9/4, 'h': 5/2, 'i': 3.0, 'j': 10/3 } ,
    'Minor': { 'a': 1.0, 'b': 9/8, 'c': 6/5, 'd': 3/2, 'e': 8/5, 'f': 2.0, 'g': 9/4, 'h': 12/5, 'i': 3.0, 'j': 16/5 }
};
let activePattern = 'Default Pattern';
let activeScale = 'Major';


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainA = audioContext.createGain();
    gainB = audioContext.createGain();
    gainMaster = audioContext.createGain();

    gainA.connect(gainMaster);
    gainB.connect(gainMaster);
    gainMaster.connect(audioContext.destination);

    gainA.gain.value = 0.4;
    gainB.gain.value = 0.4;
    gainMaster.gain.value = 0.5;
    
    setupScaleDropdown();
    setupPatternDropdown();
    setupEventListeners();
    setupFileUploads();
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
     console.log('setupEventListeners called');
    document.getElementById('loopButton1').addEventListener('click', () => {
        loopPlaying1 = !loopPlaying1;
        const loopButton1 = document.getElementById('loopButton1');
        if (loopPlaying1) {
          console.log('Loop A started');
            playLoop1();
            loopButton1.textContent = "STOP LOOP A";
            loopButton1.style.backgroundColor = "#0F0";
        } else {
             console.log('Loop A stopped');
            clearTimeout(timeoutID1);
            loopButton1.textContent = "PLAY LOOP A";
            loopButton1.style.backgroundColor = "#111";
        }
    });

    document.getElementById('loopButton2').addEventListener('click', () => {
        loopPlaying2 = !loopPlaying2;
        const loopButton2 = document.getElementById('loopButton2');
        if (loopPlaying2) {
            console.log('Loop B started');
            playLoop2();
            loopButton2.textContent = "STOP LOOP B";
            loopButton2.style.backgroundColor = "#0F0";
        } else {
            console.log('Loop B stopped');
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
          console.log('File A loaded');
            const arrayBuffer = await file.arrayBuffer();
            sound1 = await audioContext.decodeAudioData(arrayBuffer);
        }
    });

    document.getElementById('audioFileB').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('File B loaded');
            const arrayBuffer = await file.arrayBuffer();
            sound2 = await audioContext.decodeAudioData(arrayBuffer);
        }
    });
}


function setupScaleDropdown() {
   console.log('setupScaleDropdown called');
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
    console.log('setupPatternDropdown called');
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
         if (loopPlaying1 && loopPlaying2) {
            currentPatternIndex = 0;
            clearTimeout(timeoutID1);
            clearTimeout(timeoutID2);
            playLoop1();
            playLoop2();
        }
    });
}
