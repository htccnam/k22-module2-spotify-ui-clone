# 🎵 Spotify Web Player Clone

An end-to-end web client replicating the core interface, user experience, and interactive features of **Spotify Web Player**. Built with **React 19**, **Vite**, and **React Router**, seamlessly integrated with a live RESTful backend.

🔗 **Live Demo:** [https://htccnam.github.io/k22-module2-spotify-ui-clone/](https://htccnam.github.io/k22-module2-spotify-ui-clone/)

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Profile
- **Registration & Validation:** Form validation for email syntax and password strength (minimum 6 characters, requiring uppercase, lowercase, and numeric digits).
- **Authentication State:** Global auth state via React Context (`AuthContext`), persistent login token in `localStorage`, and automated `Bearer` token injection via Axios interceptors.
- **Account Controls:** Modal-based authentication, user profile dropdown, initials avatar fallback, and one-click logout redirecting to Home.

### 2. 🔍 Real-Time Universal Search
- **Trending Queries:** Immediate display of trending searches when the search box receives focus.
- **Debounced Universal Search:** 400ms debounce buffer minimizes backend API traffic while fetching live results across tracks, albums, artists, and playlists.
- **Instant Navigation:** Direct routing to dedicated detail views upon clicking any result.

### 3. 📚 Customizable Library & Sidebar
- **4 Distinct View Modes:**
  - `Compact List`: Minimalist typography-only view.
  - `Default List`: Standard Spotify list layout with thumbnails, title, entity type, and owner.
  - `Compact Grid`: High-density image-first grid with hover metadata.
  - `Default Grid`: Vertical card-style grid with enlarged album/artist artwork.
- **In-Library Search:** Expandable search bar with automatic focus for real-time keyword filtering.
- **Filter Chips & Sorting:** Multi-category chips (Playlists, Artists, Albums) paired with 3 sorting criteria: *Recently Added*, *Alphabetical*, and *Creator*.
- **Right-Click Context Menu:** Custom menu to Unfollow artists, Remove items from library, or Delete self-created playlists.
- **Playlist Creation:** Modal to create new playlists, edit names, descriptions, public/private visibility, and upload custom cover images.

### 4. 🏠 Dynamic Home Experience
- **Time-Aware Greeting:** Greets users with *Good morning*, *Good afternoon*, or *Good evening* based on real-time client clock.
- **Rich Sections:** Curated rows for *Trending Artists*, *Popular Albums*, *Featured Playlists*, and *Today's Top Tracks*.
- **Interactive Media Cards:** Signature hover effect with the floating Spotify green play button.
- **Fault-Tolerant Skeleton Loading:** Shimmer placeholders while fetching data asynchronously.

### 5. 📄 Comprehensive Detail Pages
- **Playlist Detail (`/playlist/:id`):** Full song table, total duration, follower count, public/private toggling, delete controls for owners, and in-place metadata & cover art upload.
- **Artist Detail (`/artist/:id`):** Monthly listeners, follower counts, follow/unfollow toggle, popular tracks table, and discography grid.
- **Album Detail (`/album/:id`):** Release year, track counts, play statistics, like toggle, and complete tracklist.
- **Track Detail (`/track/:id`):** Deep-dive track information, artist/album quick links, and recommendations for other popular releases by the artist.
- **Interactive Track Table:** Row hover transforms index numbers into play triggers, direct heart toggling, and nested context menus to *"Add to Playlist"* or *"Remove from Playlist"*.

### 6. 🎧 Global Bottom Music Player
- **Continuous Playback:** Managed via a centralized `PlayerContext` and native HTML5 Audio element, ensuring uninterrupted audio streams during client-side route transitions.
- **Audio Controls:** Play/Pause, Next/Previous track navigation, queue management, and automatic track-ended progression.
- **Shuffle & Loop Modes:** Algorithmic queue shuffling and 3-stage loop cycles (*Off* ➔ *Repeat All* ➔ *Repeat One*).
- **Interactive Seek & Volume Bars:** Custom range sliders styled with dual-colored dynamic fill gradients for real-time scrub and volume adjustment (with quick mute toggle).

### 7. 💡 Refined Micro-Interactions & Tooltips
- **Custom Tooltip System:** Lightweight `<Tooltip>` component providing dark-themed tooltip bubbles across interactive icons (Home, Avatar, Playlist creation, Sidebar search, Player controls).
- **Responsive Layout:** Adaptive design supporting desktop multi-column layouts, tablet collapsible sidebars, and compact mobile views.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Build & Tooling** | Vite v8, Node.js |
| **UI Library** | React 19 (JSX) |
| **Routing** | React Router v7 (`BrowserRouter` with dynamic base configuration) |
| **State Management** | React Context API (`AuthContext`, `UIContext`, `PlayerContext`) |
| **HTTP Client** | Axios (with request/response interceptors) |
| **Icons & UI Feedback** | Lucide React, React Hot Toast |
| **Styling** | Custom Vanilla CSS (Spotify design language, responsive grids, animations) |
| **Deployment** | GitHub Pages (with SPA 404 fallback routing) |

---

## 🏛️ Engineering Highlights

1. **Mixed-Content Protection:** Enforces automated protocol normalization (`http://` ➔ `https://`) via utility functions to prevent modern web browsers from blocking remote media assets.
2. **Concurrent Fault-Tolerance:** Leverages `Promise.allSettled` across data-aggregation views so individual endpoint failures never crash the entire page.
3. **Strict-Mode Race Condition Mitigation:** Implements active lifecycle flags (`let active = true; return () => { active = false; }`) in all asynchronous `useEffect` hooks to prevent memory leaks and state corruption under double-mount cycles.
4. **Data Normalization Layer:** Converts heterogeneous API structures into uniform media interfaces before rendering components, decoupling UI layers from backend schemas.
5. **SPA Routing on GitHub Pages:** Configured automated generation of `404.html` identical to `index.html` alongside `basename` injection to preserve client-side routing on page reloads.

---

## 📂 Project Structure

```text
src/
├── api/                   # Modular API services
│   ├── client.js          # Axios instance + token interceptor
│   ├── auth.js            # Login, register, me, logout endpoints
│   ├── search.js          # Trending & universal search
│   ├── browse.js          # Home browse & trending categories
│   ├── library.js         # User playlists, liked albums, followed artists
│   └── details.js         # Dedicated endpoints for playlists, albums, artists, tracks
├── context/               # Global React context providers
│   ├── AuthContext.jsx    # User session, login, logout state
│   ├── UIContext.jsx      # Modal orchestration (login / register)
│   └── PlayerContext.jsx  # Global audio playback, queue & controls
├── components/            # Reusable UI components
│   ├── Layout.jsx         # App shell (Sidebar + Header + Main Content + Player)
│   ├── Header.jsx         # Navigation bar, search bar, user menu
│   ├── Sidebar.jsx        # Library sidebar with 4 view modes & search
│   ├── SearchBox.jsx      # Debounced search input with live dropdown
│   ├── MediaCard.jsx      # Universal media card with hover play button
│   ├── TrackTable.jsx     # Full-featured track list table
│   ├── DetailHeader.jsx   # Hero banner for detail views
│   ├── Tooltip.jsx        # Custom dark tooltip component
│   ├── Player.jsx         # Bottom audio player bar
│   ├── AuthModal.jsx      # Login & Registration modal
│   ├── CreatePlaylistModal.jsx  # New playlist creation modal
│   ├── EditPlaylistModal.jsx    # Playlist editing & image upload modal
│   ├── AddToPlaylistModal.jsx   # Modal to add track to personal playlist
│   └── ContextMenu.jsx    # Custom right-click context menu
├── pages/                 # Route views
│   ├── Home.jsx           # Main landing view with time greeting & sections
│   ├── PlaylistDetail.jsx # Playlist overview & song management
│   ├── ArtistDetail.jsx   # Artist profile, top tracks, discography
│   ├── AlbumDetail.jsx    # Album tracklist & artist metadata
│   └── TrackDetail.jsx    # Track playback, lyrics/recommendations
├── routes/
│   └── index.jsx          # Route declarations
├── utils/
│   └── format.js          # Duration, date, and numerical formatting helpers
├── config.js              # Base backend configuration & URL normalizer
├── index.css              # Global styles & design tokens
└── main.jsx               # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/htccnam/k22-module2-spotify-ui-clone.git
   cd k22-module2-spotify-ui-clone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Lint code:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 👤 Author

Developed by **[htccnam](https://github.com/htccnam)** as part of the K22 React Advanced Frontend Module.
