// Global variables
let isPlaying = false;
let currentTime = 0; // seconds (0:00)
let totalTime = 143; // seconds (2:23)
let spinTween;
let progressTween;
let isDragging = false;
let isManualSpinning = false;
let lastSpinAngle = 0;
let spinVelocity = 0;

// DOM elements
const mainContainer = document.getElementById("mainContainer");
const albumArt = document.getElementById("albumArt");
const albumImg = document.getElementById("albumImg");
const audioPlayer = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const seekBar = document.getElementById("seekBar");
const seekProgress = document.getElementById("seekProgress");
const seekHandle = document.getElementById("seekHandle");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const songDetails = document.getElementById("songDetails");
const seekBarContainer = document.getElementById("seekBarContainer");
const playerControls = document.getElementById("playerControls");
const spinIndicator = document.getElementById("spinIndicator");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const songName = document.getElementById("songName");
const artists = document.getElementById("artists");

// Register GSAP plugins
gsap.registerPlugin(Draggable);

// Song database
const songs = [
  {
    name: "Watching Him Fade Away",
    artist: "Mac DeMarco",
    image: "img/this old dog.jpg",
    audio: "Watching Him Fade Away 1.mp3",
    duration: 143
  },
  {
    name: "No Other Heart",
    artist: "Mac DeMarco",
    image: "img/another one.jpg",
    audio: "No Other Heart 2.mp3",
    duration: 173
  },
  {
    name: "My Kind of Woman",
    artist: "Mac DeMarco",
    image: "img/2.jpg",
    audio: "My Kind of Woman 1.mp3",
    duration: 191
  }
];

let currentSongIndex = 0;

// SVG Icons
const playIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24" stroke="white" stroke-width="2">
                <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
        `;

const pauseIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                <rect x="6" y="4" width="4" height="16" rx="1"></rect>
            </svg>
        `;

// Utility functions
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updateTimeDisplay() {
  currentTimeEl.textContent = formatTime(currentTime);
  totalTimeEl.textContent = formatTime(totalTime);
}

// Audio functions
function loadSong(index) {
  const song = songs[index];
  audioPlayer.src = song.audio;
  audioPlayer.load();
  totalTime = song.duration;
  updateTimeDisplay();
  updateSongDisplay();
}

function updateSongDisplay() {
  const song = songs[currentSongIndex];
  songName.textContent = song.name;
  artists.textContent = song.artist;
  albumImg.src = song.image;
  albumImg.alt = `${song.name} Album Cover`;
}

function playSong() {
  audioPlayer.play();
  isPlaying = true;
  playPauseBtn.innerHTML = pauseIcon;
  startSpinning();
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playPauseBtn.innerHTML = playIcon;
  stopSpinning();
}

function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

function updateProgress() {
  if (!isDragging) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekProgress.style.width = `${progress}%`;
    currentTime = audioPlayer.currentTime;
    updateTimeDisplay();
  }
}

function seekToPosition(event) {
  const rect = seekBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
  currentTime = newTime;
  updateTimeDisplay();
  updateProgress();
}

// Initialize GSAP animations
function initializeAnimations() {
  // Container entrance animation
  gsap.to(mainContainer, {
    duration: 0.8,
    opacity: 1,
    y: 0,
    scale: 1,
    ease: "back.out(1.7)"
  });

  // Stagger animations for content
  gsap.to([songDetails, seekBarContainer, playerControls], {
    duration: 0.6,
    opacity: 1,
    y: 0,
    stagger: 0.2,
    delay: 0.3,
    ease: "power2.out"
  });
}

// Album spinning controls
function startSpinning() {
  if (spinTween) spinTween.kill();
  spinTween = gsap.to(albumArt, {
    duration: 8,
    rotation: "+=360",
    repeat: -1,
    ease: "none"
  });
}

function stopSpinning() {
  if (spinTween) {
    spinTween.kill();
    gsap.to(albumArt, {
      duration: 0.5,
      rotation: Math.round(gsap.getProperty(albumArt, "rotation") / 360) * 360,
      ease: "power2.out"
    });
  }
}

// Manual spinning with Draggable
function initializeDraggable() {
  const draggable = Draggable.create(albumArt, {
    type: "rotation",
    onDragStart: function () {
      isManualSpinning = true;
      isDragging = true;
      lastSpinAngle = this.rotation;
      if (spinTween) spinTween.kill();

      gsap.to(spinIndicator, {
        duration: 0.3,
        opacity: 1,
        y: -5,
        ease: "power2.out"
      });
    },
    onDrag: function () {
      const angleDiff = this.rotation - lastSpinAngle;
      spinVelocity = angleDiff;

      // Calculate seek based on spin
      const seekChange = (angleDiff / 360) * audioPlayer.duration; // Full duration per full rotation
      const newTime = Math.max(0, Math.min(audioPlayer.duration, audioPlayer.currentTime + seekChange));
      audioPlayer.currentTime = newTime;
      currentTime = newTime;

      updateProgress();
      updateTimeDisplay();
      lastSpinAngle = this.rotation;
    },
    onDragEnd: function () {
      isManualSpinning = false;
      isDragging = false;

      gsap.to(spinIndicator, {
        duration: 0.3,
        opacity: 0,
        y: 0,
        ease: "power2.out"
      });

      if (isPlaying) {
        setTimeout(() => {
          if (!isDragging) startSpinning();
        }, 100);
      }
    }
  });
}

// Progress bar functionality
function updateProgress() {
  if (!isDragging) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekProgress.style.width = `${progress}%`;
    currentTime = audioPlayer.currentTime;
    updateTimeDisplay();
  }
}

function initializeSeekBar() {
  let isDraggingSeek = false;

  // Click to seek
  seekBar.addEventListener("click", (e) => {
    if (isDraggingSeek) return;
    seekToPosition(e);
  });

  // Make seek bar draggable
  seekBar.addEventListener("mousedown", (e) => {
    isDraggingSeek = true;
    const rect = seekBar.getBoundingClientRect();

    function onMouseMove(event) {
      const progress = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
      );
      const newTime = progress * audioPlayer.duration;
      audioPlayer.currentTime = newTime;
      currentTime = newTime;
      updateProgress();
      updateTimeDisplay();
    }

    function onMouseUp() {
      isDraggingSeek = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Initial update
    onMouseMove(e);
  });
}

// Play/Pause functionality
function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }

  // Button animation
  gsap.to(playPauseBtn, {
    duration: 0.1,
    scale: 0.9,
    yoyo: true,
    repeat: 1,
    ease: "power2.out"
  });
}

// Progress timer
let progressTimer;
function startProgressTimer() {
  // Audio events will handle progress updates
}

function stopProgressTimer() {
  // Audio events will handle progress updates
}

// Song transition
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  if (isPlaying) {
    playSong();
  }
}

// Event listeners
playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Button hover animations
[prevBtn, nextBtn].forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    gsap.to(btn, {
      duration: 0.3,
      scale: 1.1,
      ease: "power2.out"
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, {
      duration: 0.3,
      scale: 1,
      ease: "power2.out"
    });
  });
});

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initializeAnimations();
  initializeDraggable();
  initializeSeekBar();
  
  // Audio event listeners
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', nextSong);
  audioPlayer.addEventListener('loadedmetadata', () => {
    totalTime = audioPlayer.duration;
    updateTimeDisplay();
  });
  
  // Load initial song
  loadSong(currentSongIndex);
  updateTimeDisplay();
  updateProgress();
});

