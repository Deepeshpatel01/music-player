let songs = [];
let songIndex = 0;
let isPlaying = false;

fetch('/api/playlist')
  .then(res => res.json())
  .then(data => {
    songs = data;
    setupPlayer();
  });

function setupPlayer() {
  const playlistEl = document.getElementById("playlist");
  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("play");
  const title = document.getElementById("title");
  const artist = document.getElementById("artist");
  const progress = document.getElementById("progress");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const volumeSlider = document.getElementById("volume");
  const autoplayCheckbox = document.getElementById("autoplay");

  function loadSong(song) {
    title.textContent = song.title;
    artist.textContent = song.artist;
    audio.src = `music/${song.name}`;
  }

  function playSong() {
    audio.play();
    isPlaying = true;
    playBtn.textContent = "⏸️";
  }

  function pauseSong() {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = "▶️";
  }

  document.getElementById("play").addEventListener("click", () => {
    isPlaying ? pauseSong() : playSong();
  });

  document.getElementById("prev").addEventListener("click", () => {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songs[songIndex]);
    playSong();
  });

  document.getElementById("next").addEventListener("click", () => {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songs[songIndex]);
    playSong();
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progress.value = progressPercent;
      currentTimeEl.textContent = formatTime(audio.currentTime);
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  progress.addEventListener("input", () => {
    audio.currentTime = (progress.value / 100) * audio.duration;
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  audio.addEventListener("ended", () => {
    if (autoplayCheckbox.checked) {
      document.getElementById("next").click();
    } else {
      pauseSong();
    }
  });

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function updatePlaylistUI() {
    playlistEl.innerHTML = "";
    songs.forEach((song, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${song.title} - ${song.artist}
        <button class="edit-btn" title="Edit">🖊️</button>
        <button class="delete-btn" title="Delete">❌</button>
      `;

      li.querySelector(".edit-btn").addEventListener("click", () => {
        const newTitle = prompt("New Title:", song.title);
        const newArtist = prompt("New Artist:", song.artist);
        if (newTitle && newArtist) {
          fetch(`/api/playlist/${song.name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, artist: newArtist })
          }).then(() => location.reload());
        }
      });

      li.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Delete ${song.title}?`)) {
          fetch(`/api/playlist/${song.name}`, {
            method: "DELETE"
          }).then(() => location.reload());
        }
      });

      li.addEventListener("click", (e) => {
        if (!e.target.classList.contains("edit-btn") && !e.target.classList.contains("delete-btn")) {
          songIndex = index;
          loadSong(song);
          playSong();
        }
      });

      playlistEl.appendChild(li);
    });
  }

  updatePlaylistUI();
  loadSong(songs[songIndex]);
}
