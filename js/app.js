/* =========================================================
   SHIVAM — AFTER HOURS
========================================================= */

/* =========================================================
   CONFIGURATION
   ONLY EDIT THIS SECTION REGULARLY
========================================================= */

/*
   ADD PLAYLISTS HERE.

   Example:

   {
       name: "LATE NIGHT",
       url: "https://youtube.com/playlist?list=XXXXXXXX"
   }

   You can keep adding playlists.
*/
const YOUTUBE_API_KEY = "YOUTUBE_API_KEY";

const playlists = [
  {
    name: "SHIVAM",
    url: "https://youtube.com/playlist?list=PLzKG7qBMz_66ZYJNHYti6Trw_F9IisHJo",
  },

  {
    name: "LATE NIGHT",
    url: "YOUR_SECOND_PLAYLIST_URL",
  },

  {
    name: "STUDY",
    url: "YOUR_THIRD_PLAYLIST_URL",
  },
];

/*
   PLAYLISTS ADDED FROM THE FRONTEND

   Saved in the browser's localStorage so they
   persist across visits without editing code.
*/

const CUSTOM_PLAYLISTS_KEY = "songtime_custom_playlists";

function loadCustomPlaylists() {
  try {
    const saved = localStorage.getItem(CUSTOM_PLAYLISTS_KEY);

    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveCustomPlaylists(list) {
  try {
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(list));
  } catch (error) {
    console.log("Could not save playlist:", error);
  }
}

playlists.push(...loadCustomPlaylists());

/*
   CUSTOM IMAGE PER SONG.

   Map a YouTube video ID to an image link/path, and
   the background will switch to that image whenever
   that song starts playing.

   How to find a video ID: it's the part after
   "v=" in a normal YouTube URL, or after the last "/"
   in a youtu.be link.

   Example:

   const songArtwork = {
       "dQw4w9WgXcQ": "./assets/artwork/song1.jpg",
       "M7lc1UVf-VE": "https://example.com/song2.jpg"
   };
*/
const songArtwork = {
  // "VIDEO_ID": "./assets/artwork/your-image.jpg",
};

/*
   ADD ARTWORK HERE.

   Put the actual images inside:

   assets/artwork/

   Then list them here.
*/

const artworks = [
  "./assets/artwork/student-study.png",
  // "./assets/artwork/02.jpg",
  // "./assets/artwork/03.jpg",
  // "./assets/artwork/04.jpg",
  // "./assets/artwork/05.jpg"
];

/*
   IMAGES ADDED FROM THE FRONTEND

   Stored as data URLs in localStorage so they
   persist across visits without editing code.
   Keep uploads modest in size/number — localStorage
   has a limit of roughly 5MB per site.
*/

const CUSTOM_ARTWORK_KEY = "songtime_custom_artwork";

function loadCustomArtwork() {
  try {
    const saved = localStorage.getItem(CUSTOM_ARTWORK_KEY);

    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveCustomArtwork(list) {
  try {
    localStorage.setItem(CUSTOM_ARTWORK_KEY, JSON.stringify(list));

    return true;
  } catch (error) {
    console.log("Could not save image:", error);

    return false;
  }
}

artworks.push(...loadCustomArtwork());

/*
   Artwork change interval.

   15000 = 15 seconds
*/

/*
   Quote change interval.

   5000 = 5 seconds
*/

const QUOTE_INTERVAL = 5000;

/* =========================================================
   QUOTES
========================================================= */

const quotes = [
  "One more song. Then I'll sleep.",

  "It was supposed to be a five-minute break.",

  "Somehow the best thoughts happen after midnight.",

  "Headphones on. World off.",

  "One more problem. Then I'm done.",

  "The room was quiet. The playlist wasn't.",

  "Maybe tomorrow. Tonight, we keep going.",

  "Late nights become memories before we notice.",

  "Coffee gets cold. Dreams don't.",

  "Nobody remembers the easy nights.",
];

/* =========================================================
   STATE
========================================================= */

let player = null;

let playerReady = false;

let isPlaying = false;

let currentPlaylist = 0;

let currentTrack = 0;

let currentPlaylistId = null;

let playingOneOff = false;

let currentArtwork = 0;

let currentQuote = 0;

let progressTimer = null;

let lastCustomArtworkVideoId = null;

let quoteTimer = null;

/* =========================================================
   DOM
========================================================= */

const musicPlayer = document.getElementById("musicPlayer");

const playButton = document.getElementById("play");

const previousButton = document.getElementById("previous");

const nextButton = document.getElementById("next");

const progress = document.getElementById("progress");

const progressContainer = document.getElementById("progressContainer");

const trackName = document.getElementById("trackName");

const trackStatus = document.getElementById("trackStatus");

const playlistName = document.getElementById("playlistName");

const quote = document.getElementById("quote");

const time = document.getElementById("time");

const backgroundA = document.getElementById("backgroundA");

const backgroundB = document.getElementById("backgroundB");

const artworkNumber = document.getElementById("artworkNumber");

const artworkTotal = document.getElementById("artworkTotal");

const imageName = document.getElementById("imageName");

const playlistSelector = document.getElementById("playlistSelector");

const songSelector = document.getElementById("songSelector");

const playlistMenu = document.getElementById("playlistMenu");

const songMenu = document.getElementById("songMenu");

const playlistItems = document.getElementById("playlistItems");

const songItems = document.getElementById("songItems");

const selectedPlaylistName = document.getElementById("selectedPlaylistName");

const playlistCount = document.getElementById("playlistCount");

const songCount = document.getElementById("songCount");

const songSearchInput = document.getElementById("songSearchInput");

const addPlaylistButton = document.getElementById("addPlaylistButton");

const addPlaylistForm = document.getElementById("addPlaylistForm");

const newPlaylistName = document.getElementById("newPlaylistName");

const newPlaylistUrl = document.getElementById("newPlaylistUrl");

const confirmAddPlaylist = document.getElementById("confirmAddPlaylist");

const addImageButton = document.getElementById("addImageButton");

const addImageInput = document.getElementById("addImageInput");

const youtubeSearchSelector = document.getElementById("youtubeSearchSelector");

const youtubeSearchMenu = document.getElementById("youtubeSearchMenu");

const youtubeSearchInput = document.getElementById("youtubeSearchInput");

const youtubeSearchResults = document.getElementById("youtubeSearchResults");

const youtubeSearchStatus = document.getElementById("youtubeSearchStatus");

/* =========================================================
   GET PLAYLIST ID
========================================================= */

function getPlaylistId(url) {
  try {
    const parsed = new URL(url);

    return parsed.searchParams.get("list");
  } catch (error) {
    return null;
  }
}

/* =========================================================
   VALID PLAYLISTS
========================================================= */

function getValidPlaylists() {
  return playlists.filter((playlist) => getPlaylistId(playlist.url));
}

function buildPlaylistSelector() {
  playlistItems.innerHTML = "";

  const valid = getValidPlaylists();

  playlistCount.textContent = valid.length;

  valid.forEach(function (playlist, index) {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "menu-item";

    button.innerHTML = `

                <span class="menu-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span class="menu-title">
                    ${escapeHTML(playlist.name)}
                </span>

            `;

    button.addEventListener("click", function (event) {
      event.stopPropagation();

      switchPlaylist(index);
    });

    playlistItems.appendChild(button);
  });

  updatePlaylistSelectorActive();
}

/* =========================================================
   INITIAL PLAYLIST
========================================================= */

function initializePlaylist() {
  const valid = getValidPlaylists();

  playlistCount.textContent = valid.length;

  buildPlaylistSelector();

  if (!valid.length) {
    trackStatus.textContent = "NO PLAYLIST";

    return;
  }

  currentPlaylist = 0;

  updatePlaylistUI();

  const playlistId = getPlaylistId(valid[0].url);

  currentPlaylistId = playlistId;

  window.youtubePlaylistId = playlistId;
}

/* =========================================================
   BUILD PLAYLIST SELECTOR
========================================================= */

async function buildSongSelector() {
  if (!playerReady || !player) {
    return;
  }

  const valid = getValidPlaylists();

  const playlistId = getPlaylistId(valid[currentPlaylist].url);

  if (!playlistId) {
    return;
  }

  try {
    const response = await fetch(`/api/youtube?playlist=${playlistId}`);

    const songs = await response.json();

    songItems.innerHTML = "";

    songCount.textContent = songs.length;

    if (songSearchInput) {
      songSearchInput.value = "";
    }

    songs.forEach(function (song, index) {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "menu-item";

      button.dataset.title = song.title.toLowerCase();

      button.innerHTML = `

                    <span class="menu-number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <span class="menu-title">
                        ${escapeHTML(song.title)}
                    </span>

                `;

      button.addEventListener("click", function (event) {
        event.stopPropagation();

        playTrack(index);
      });

      songItems.appendChild(button);
    });

    updateSongActive();
  } catch (error) {
    console.error("Song loading failed:", error);

    songCount.textContent = "ERROR";
  }
}

/* =========================================================
   UPDATE PLAYLIST UI
========================================================= */

function updatePlaylistUI() {
  const valid = getValidPlaylists();

  if (!valid.length) {
    return;
  }

  const playlist = valid[currentPlaylist];

  selectedPlaylistName.textContent = playlist.name;

  playlistName.textContent = playlist.name;

  updatePlaylistSelectorActive();
}

/* =========================================================
   PLAYLIST ACTIVE STATE
========================================================= */

function updatePlaylistSelectorActive() {
  const buttons = playlistItems.querySelectorAll(".menu-item");

  buttons.forEach(function (button, index) {
    button.classList.toggle("active", index === currentPlaylist);
  });
}

/* =========================================================
   SWITCH PLAYLIST
========================================================= */

function switchPlaylist(index) {
  const valid = getValidPlaylists();

  if (!valid[index]) {
    return;
  }

  currentPlaylist = index;

  currentTrack = 0;

  updatePlaylistUI();

  closeMenus();

  if (!playerReady || !player) {
    return;
  }

  const playlistId = getPlaylistId(valid[index].url);

  if (!playlistId) {
    return;
  }

  currentPlaylistId = playlistId;

  playingOneOff = false;

  trackStatus.textContent = "LOADING PLAYLIST";

  isPlaying = false;

  musicPlayer.classList.remove("playing");

  playButton.textContent = "▶";

  stopProgress();

  resetProgress();

  /*
       Load the new YouTube playlist.
    */

  player.loadPlaylist({
    listType: "playlist",

    list: playlistId,

    index: 0,
  });

  /*
       Give YouTube a moment to load
       the playlist before building
       the song selector.
    */

  setTimeout(function () {
    buildSongSelector();
  }, 1000);
}

/* =========================================================
   LOAD YOUTUBE API
========================================================= */

function loadYouTubeAPI() {
  const existing = document.getElementById("youtube-api");

  if (existing) {
    return;
  }

  const script = document.createElement("script");

  script.id = "youtube-api";

  script.src = "https://www.youtube.com/iframe_api";

  document.head.appendChild(script);
}

/* =========================================================
   YOUTUBE READY
========================================================= */

window.onYouTubeIframeAPIReady = function () {
  if (!window.youtubePlaylistId) {
    return;
  }

  player = new YT.Player("youtube-player", {
    width: "1",

    height: "1",

    playerVars: {
      autoplay: 0,

      controls: 0,

      disablekb: 1,

      fs: 0,

      modestbranding: 1,

      playsinline: 1,

      rel: 0,

      listType: "playlist",

      list: window.youtubePlaylistId,
    },

    events: {
      onReady: onPlayerReady,

      onStateChange: onPlayerStateChange,

      onError: onPlayerError,
    },
  });
};

/* =========================================================
   PLAYER READY
========================================================= */

function onPlayerReady() {
  playerReady = true;

  trackStatus.textContent = "READY";

  setTimeout(buildSongSelector, 800);
}

/* =========================================================
   PLAY SELECTED SONG
========================================================= */

function playTrack(index) {
  if (!playerReady || !player) {
    return;
  }

  /*
       If we were playing a one-off search result,
       the player's internal playlist is gone —
       reload the real playlist first so playback
       controls work correctly again.
    */

  if (playingOneOff) {
    console.log(
      "[songtime] Restoring playlist after search. id=",
      currentPlaylistId,
      "index=",
      index,
    );

    if (!currentPlaylistId) {
      console.log(
        "[songtime] No currentPlaylistId set — cannot restore playlist.",
      );

      return;
    }

    playingOneOff = false;

    currentTrack = index;

    trackStatus.textContent = "LOADING PLAYLIST";

    isPlaying = false;

    musicPlayer.classList.remove("playing");

    playButton.textContent = "▶";

    stopProgress();

    resetProgress();

    player.loadPlaylist({
      listType: "playlist",

      list: currentPlaylistId,

      index: index,
    });

    updateSongActive();

    closeMenus();

    return;
  }

  const playlist = player.getPlaylist();

  if (!playlist || index < 0 || index >= playlist.length) {
    return;
  }

  currentTrack = index;

  player.playVideoAt(index);

  updateSongActive();

  closeMenus();
}

function playOneOffVideo(videoId, title) {
  if (!playerReady || !player) {
    return;
  }

  currentTrack = -1;

  playingOneOff = true;

  updateSongActive();

  player.loadVideoById(videoId);

  trackName.textContent = title || "LOADING...";

  trackStatus.textContent = "BUFFERING";

  closeMenus();
}

/* =========================================================
   SONG ACTIVE STATE
========================================================= */

function updateSongActive() {
  const buttons = songItems.querySelectorAll(".menu-item");

  buttons.forEach(function (button, index) {
    button.classList.toggle("active", index === currentTrack);
  });
}

/* =========================================================
   PLAYER STATE
========================================================= */

function onPlayerStateChange(event) {
  if (!window.YT) {
    return;
  }

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;

    musicPlayer.classList.add("playing");

    playButton.textContent = "Ⅱ";

    trackStatus.textContent = "NOW PLAYING";

    const index = !playingOneOff ? player.getPlaylistIndex() : -1;

    if (typeof index === "number" && index >= 0) {
      currentTrack = index;

      updateSongActive();
    }

    updateTrackName();

    startProgress();

    try {
      const videoData = player.getVideoData();

      const videoId = videoData && videoData.video_id;

      if (videoId !== lastCustomArtworkVideoId) {
        lastCustomArtworkVideoId = videoId;

        if (videoId && songArtwork[videoId]) {
          showArtworkImage(
            songArtwork[videoId],
            videoData.title ? videoData.title.toUpperCase() : "CUSTOM",
          );
        } else if (artworks.length) {
          /*
                       No custom artwork set for this
                       song — advance to the next image
                       in the loop.
                    */

          nextArtwork();
        }
      }
    } catch (error) {
      // video data not ready yet, ignore
    }
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;

    musicPlayer.classList.remove("playing");

    playButton.textContent = "▶";

    trackStatus.textContent = "PAUSED";

    stopProgress();
  } else if (event.data === YT.PlayerState.BUFFERING) {
    trackStatus.textContent = "BUFFERING";
  } else if (event.data === YT.PlayerState.ENDED) {
    isPlaying = false;

    musicPlayer.classList.remove("playing");

    playButton.textContent = "▶";

    trackStatus.textContent = "ENDED";

    stopProgress();

    resetProgress();
  }
}

/* =========================================================
   PLAYER ERROR
========================================================= */

function onPlayerError(event) {
  console.error("YouTube error:", event.data);

  trackStatus.textContent = "PLAYBACK ERROR";
}

/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {
  if (!playerReady || !player) {
    trackStatus.textContent = "LOADING...";

    return;
  }

  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

/* =========================================================
   PREVIOUS
========================================================= */

function previousTrack() {
  if (!playerReady || !player) {
    return;
  }

  if (playingOneOff) {
    playTrack(0);

    return;
  }

  player.previousVideo();
}

/* =========================================================
   NEXT
========================================================= */

function nextTrack() {
  if (!playerReady || !player) {
    return;
  }

  if (playingOneOff) {
    playTrack(0);

    return;
  }

  player.nextVideo();
}

/* =========================================================
   TRACK TITLE
========================================================= */

function updateTrackName() {
  if (!playerReady || !player) {
    return;
  }

  try {
    const data = player.getVideoData();

    if (data && data.title) {
      trackName.textContent = data.title;
    }
  } catch (error) {
    console.log("Track title unavailable.");
  }
}

/* =========================================================
   PROGRESS
========================================================= */

function startProgress() {
  stopProgress();

  progressTimer = setInterval(updateProgress, 500);
}

function stopProgress() {
  if (progressTimer) {
    clearInterval(progressTimer);

    progressTimer = null;
  }
}

function updateProgress() {
  if (!playerReady || !player) {
    return;
  }

  try {
    const current = player.getCurrentTime();

    const duration = player.getDuration();

    if (!duration || duration <= 0) {
      return;
    }

    const percentage = (current / duration) * 100;

    progress.style.width = `${percentage}%`;
  } catch (error) {
    // Player not ready.
  }
}

function resetProgress() {
  progress.style.width = "0%";
}

/* =========================================================
   SEEK
========================================================= */

function seek(event) {
  if (!playerReady || !player) {
    return;
  }

  const rect = progressContainer.getBoundingClientRect();

  const position = event.clientX - rect.left;

  const percentage = position / rect.width;

  const duration = player.getDuration();

  if (!duration || duration <= 0) {
    return;
  }

  player.seekTo(duration * percentage, true);
}

/* =========================================================
   ARTWORK
========================================================= */

function initializeArtwork() {
  if (!artworks.length) {
    artworkTotal.textContent = "00";

    return;
  }

  artworkTotal.textContent = String(artworks.length).padStart(2, "0");

  currentArtwork = 0;

  showArtwork(currentArtwork, true);
}

function showArtwork(index, immediate = false) {
  if (!artworks.length) {
    return;
  }

  const image = artworks[index];

  const active = currentArtwork % 2 === 0 ? backgroundA : backgroundB;

  const hidden = currentArtwork % 2 === 0 ? backgroundB : backgroundA;

  hidden.style.backgroundImage = `url("${image}")`;

  if (immediate) {
    backgroundA.style.backgroundImage = `url("${image}")`;

    backgroundA.classList.add("active");

    backgroundB.classList.remove("active");
  } else {
    hidden.classList.add("active");

    active.classList.remove("active");
  }

  artworkNumber.textContent = String(index + 1).padStart(2, "0");

  const isDataUrl = image.startsWith("data:");

  const filename = isDataUrl ? "" : image.split("/").pop().split(".")[0];

  imageName.textContent = filename
    ? filename.toUpperCase()
    : `MEMORY_${String(index + 1).padStart(2, "0")}`;
}

function nextArtwork() {
  if (!artworks.length) {
    return;
  }

  currentArtwork = (currentArtwork + 1) % artworks.length;

  showArtwork(currentArtwork);
}

function showArtworkImage(url, label) {
  const activeIsA = backgroundA.classList.contains("active");

  const hidden = activeIsA ? backgroundB : backgroundA;

  const active = activeIsA ? backgroundA : backgroundB;

  hidden.style.backgroundImage = `url("${url}")`;

  hidden.classList.add("active");

  active.classList.remove("active");

  if (label) {
    imageName.textContent = label;
  }
}

/* =========================================================
   QUOTES
========================================================= */

function initializeQuotes() {
  if (!quotes.length) {
    return;
  }

  quote.textContent = quotes[currentQuote];

  quoteTimer = setInterval(nextQuote, QUOTE_INTERVAL);
}

function nextQuote() {
  quote.classList.add("fade");

  setTimeout(function () {
    currentQuote = (currentQuote + 1) % quotes.length;

    quote.textContent = quotes[currentQuote];

    quote.classList.remove("fade");
  }, 450);
}

/* =========================================================
   CLOCK
========================================================= */

function updateClock() {
  const now = new Date();

  let hours = now.getHours();

  const minutes = now.getMinutes();

  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  time.textContent = `${hours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/* =========================================================
   PLAYLIST MENU
========================================================= */

playlistSelector.addEventListener("click", function (event) {
  event.stopPropagation();

  const alreadyOpen = musicPlayer.classList.contains("playlist-open");

  closeMenus();

  if (!alreadyOpen) {
    musicPlayer.classList.add("playlist-open");
  }
});

/* =========================================================
   SONG MENU
========================================================= */

songSelector.addEventListener("click", function (event) {
  event.stopPropagation();

  const alreadyOpen = musicPlayer.classList.contains("song-open");

  closeMenus();

  if (!alreadyOpen) {
    musicPlayer.classList.add("song-open");
  }
});

/* =========================================================
   SONG SEARCH
========================================================= */

if (songSearchInput) {
  songSearchInput.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  songSearchInput.addEventListener("input", function () {
    const query = songSearchInput.value.trim().toLowerCase();

    const items = songItems.querySelectorAll(".menu-item");

    items.forEach(function (item) {
      const matches = !query || item.dataset.title.includes(query);

      item.style.display = matches ? "flex" : "none";
    });
  });
}

/* =========================================================
   ADD PLAYLIST
========================================================= */

if (addPlaylistButton) {
  addPlaylistButton.addEventListener("click", function (event) {
    event.stopPropagation();

    addPlaylistForm.classList.toggle("open");

    if (addPlaylistForm.classList.contains("open")) {
      newPlaylistName.focus();
    }
  });

  addPlaylistForm.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  confirmAddPlaylist.addEventListener("click", function () {
    const name = newPlaylistName.value.trim();

    const url = newPlaylistUrl.value.trim();

    if (!name || !url) {
      alert("Please enter a playlist name and URL.");

      return;
    }

    if (!getPlaylistId(url)) {
      alert(
        'That doesn\'t look like a valid YouTube playlist URL (it should contain "list=").',
      );

      return;
    }

    const wasEmpty = getValidPlaylists().length === 0;

    playlists.push({
      name: name,
      url: url,
    });

    const custom = loadCustomPlaylists();

    custom.push({
      name: name,
      url: url,
    });

    saveCustomPlaylists(custom);

    newPlaylistName.value = "";

    newPlaylistUrl.value = "";

    addPlaylistForm.classList.remove("open");

    if (wasEmpty) {
      initializePlaylist();
    } else {
      buildPlaylistSelector();
    }
  });
}

/* =========================================================
   ADD IMAGE
========================================================= */

if (addImageButton) {
  addImageButton.addEventListener("click", function (event) {
    event.stopPropagation();

    addImageInput.click();
  });

  addImageInput.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  addImageInput.addEventListener("change", function () {
    const files = Array.from(addImageInput.files || []);

    if (!files.length) {
      return;
    }

    const wasEmpty = artworks.length === 0;

    const custom = loadCustomArtwork();

    let remaining = files.length;

    files.forEach(function (file) {
      const reader = new FileReader();

      reader.onload = function () {
        const dataUrl = reader.result;

        artworks.push(dataUrl);

        custom.push(dataUrl);

        remaining--;

        if (remaining === 0) {
          const saved = saveCustomArtwork(custom);

          if (!saved) {
            alert(
              "Image(s) added for this session, but couldn't be saved permanently — storage limit reached. Try smaller or fewer images.",
            );
          }

          if (wasEmpty) {
            initializeArtwork();
          } else {
            artworkTotal.textContent = String(artworks.length).padStart(2, "0");
          }
        }
      };

      reader.readAsDataURL(file);
    });

    addImageInput.value = "";
  });
}

/* =========================================================
   YOUTUBE SEARCH (SEARCH ALL OF YOUTUBE)
========================================================= */

let youtubeSearchTimer = null;

if (youtubeSearchSelector) {
  youtubeSearchSelector.addEventListener("click", function (event) {
    event.stopPropagation();

    const alreadyOpen = musicPlayer.classList.contains("youtube-search-open");

    closeMenus();

    if (!alreadyOpen) {
      musicPlayer.classList.add("youtube-search-open");

      youtubeSearchInput.focus();
    }
  });

  youtubeSearchMenu.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  youtubeSearchInput.addEventListener("input", function () {
    const query = youtubeSearchInput.value.trim();

    clearTimeout(youtubeSearchTimer);

    if (!query) {
      youtubeSearchResults.innerHTML = "";

      youtubeSearchStatus.textContent = "";

      return;
    }

    youtubeSearchStatus.textContent = "...";

    youtubeSearchTimer = setTimeout(function () {
      runYoutubeSearch(query);
    }, 500);
  });
}

async function runYoutubeSearch(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

    const data = await response.json();

    if (!Array.isArray(data)) {
      youtubeSearchStatus.textContent = "ERROR";

      youtubeSearchResults.innerHTML = `<div class="yt-search-empty">
                    Couldn't search right now. Try again.
                </div>`;

      return;
    }

    youtubeSearchStatus.textContent = String(data.length);

    if (!data.length) {
      youtubeSearchResults.innerHTML = `<div class="yt-search-empty">
                    No results found.
                </div>`;

      return;
    }

    youtubeSearchResults.innerHTML = "";

    data.forEach(function (result) {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "yt-result";

      button.innerHTML = `

                    <img
                        class="yt-result-thumb"
                        src="${escapeHTML(result.thumbnail || "")}"
                        alt=""
                        onerror="this.style.display='none'"
                    >

                    <span class="yt-result-text">

                        <span class="yt-result-title">
                            ${escapeHTML(result.title)}
                        </span>

                        <span class="yt-result-channel">
                            ${escapeHTML(result.channel)}
                        </span>

                    </span>

                `;

      button.addEventListener("click", function (event) {
        event.stopPropagation();

        playOneOffVideo(result.id, result.title);
      });

      youtubeSearchResults.appendChild(button);
    });
  } catch (error) {
    youtubeSearchStatus.textContent = "ERROR";

    youtubeSearchResults.innerHTML = `<div class="yt-search-empty">
                Couldn't search right now. Try again.
            </div>`;
  }
}

/* =========================================================
   CLOSE MENUS
========================================================= */

function closeMenus() {
  musicPlayer.classList.remove("playlist-open");

  musicPlayer.classList.remove("song-open");

  musicPlayer.classList.remove("youtube-search-open");

  if (addPlaylistForm) {
    addPlaylistForm.classList.remove("open");
  }
}

document.addEventListener("click", function () {
  closeMenus();
});

/* =========================================================
   CONTROLS
========================================================= */

playButton.addEventListener("click", togglePlay);

previousButton.addEventListener("click", previousTrack);

nextButton.addEventListener("click", nextTrack);

progressContainer.addEventListener("click", seek);

/* =========================================================
   VINYL DOUBLE CLICK
========================================================= */

const disc = document.querySelector(".disc");

if (disc) {
  disc.addEventListener("dblclick", togglePlay);
}

/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener("keydown", function (event) {
  const tag = document.activeElement.tagName;

  if (tag === "INPUT" || tag === "TEXTAREA") {
    return;
  }

  /*
            SPACE
        */

  if (event.code === "Space") {
    event.preventDefault();

    togglePlay();

    return;
  }

  /*
            LEFT
        */

  if (event.code === "ArrowLeft") {
    previousTrack();

    return;
  }

  /*
            RIGHT
        */

  if (event.code === "ArrowRight") {
    nextTrack();

    return;
  }

  /*
            ESC
        */

  if (event.code === "Escape") {
    closeMenus();
  }
});

/* =========================================================
   BASIC HTML ESCAPING
========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {
  initializePlaylist();

  initializeArtwork();

  initializeQuotes();

  updateClock();

  setInterval(updateClock, 1000);

  loadYouTubeAPI();
}

initialize();
