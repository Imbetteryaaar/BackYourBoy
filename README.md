<h1 align="center">🎉 Back Your Boy</h1>

<p align="center">
  <b>A chaotic real-time party game of bluffing, bidding, and backing your friends.</b><br/>
  Two teams. One category. How many can your champion <i>really</i> name? Put your points where your mouth is.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-4FC0E8?logo=react&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-WebSockets-34D399?logo=fastapi&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-Tailwind-8B5CF6?logo=vite&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-FFD23F">
</p>

> Play together from any phone or laptop — just share a 4-letter room code. No installs, no accounts.

---

## 🎮 How to play

Back Your Boy is a Jackbox-style game for **4+ players** split into two teams (Pink vs Blue). Each round:

1. **The category drops.** Something like *"Name brands of cars"* or *"Name countries in Africa."*
2. **Back your boy.** Each team votes for the one teammate (the **"Boy"**) they trust to perform. A second teammate becomes the **Backer**.
3. **Bidding war.** The two Backers take turns bidding how many answers their Boy can name — *5… 7… 9…* The bids climb until someone smells a bluff and screams **BULLSHIT!** 🐂
4. **Stakes.** Whoever was holding the bid is now on the hook. Their Backer can play it safe… or gamble on **Double or Nothing**.
5. **Showtime.** The Boy races the clock to actually name that many things.
6. **Judgement.** The other team strikes out any wrong or repeated answers. Hit the target → your team scores. Fall short → the point goes to the challengers.

Most points after the final round wins. Talk big at your own risk.

---

## ✨ What's inside

- **Two performance modes**
  - ⌨️ **Type It** — type answers against the clock, with satisfying pops, combo callouts and a live progress ring.
  - 🗣️ **Speak It** — say answers out loud and smack a giant tap-counter. Perfect when you're all in a room or on a call. The opposing team is the judge.
  - 🎲 **Mixed** — the mode is randomised every round.
- **Double or Nothing** power-up for clutch, comeback-friendly chaos.
- **11 themed category packs** (Classic, Brands, Geography, Pop Culture, Music, Food, Sports, Nerdy, Animals, Everyday, and a 🌶️ Spicy pack) — ~280 prompts and counting. The host toggles packs on/off and can reroll or write custom categories.
- **Playful, animated UI** — bouncy 2D mascots, confetti, sound effects, and a fully **mobile-friendly** layout.
- **Resilient multiplayer** — auto-reconnect, host migration, and graceful round-abort if someone drops.

---

## 🖼️ Screenshots

> _Add your own! Drop images in a `docs/` folder and link them here._

| Lobby | Bidding War | Showtime |
| --- | --- | --- |
| _coming soon_ | _coming soon_ | _coming soon_ |

---

## 🧱 Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, react-nice-avatar |
| Backend | FastAPI, native WebSockets (in-memory game state) |
| Audio/FX | Web Audio API (no audio assets to ship), SVG mascots |

The backend keeps all game state in memory — no database required.

---

## 🚀 Quick start (local)

You'll need **Python 3.11+** and **Node 18+**.

**1. Backend**

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). The frontend talks to `http://localhost:8000` by default.

> Playing across devices on the same Wi-Fi? Set `frontend/.env.local`:
> ```
> VITE_API_URL=http://YOUR-COMPUTER-LAN-IP:8000
> ```
> and start the backend with `--host 0.0.0.0`.

---

## ☁️ Deploy (free): Render + Vercel

The backend needs an **always-on** host (WebSockets), so it goes on Render. The static frontend goes on Vercel.

### 1) Backend → Render

1. Push this repo to GitHub.
2. On [Render](https://render.com): **New → Blueprint**, select the repo. It reads `render.yaml` and creates the `back-your-boy-api` web service (root `backend/`).
3. After it's live, copy the URL, e.g. `https://back-your-boy-api.onrender.com`.

> The free tier sleeps after ~15 min idle, so the first connection of the day takes ~50s to wake. Fine for game nights.

### 2) Frontend → Vercel

1. On [Vercel](https://vercel.com): **Add New → Project**, import the repo, set **Root Directory** to `frontend`.
2. Add an environment variable:
   - `VITE_API_URL` = your Render URL (e.g. `https://back-your-boy-api.onrender.com`)
3. Deploy. Vercel gives you a URL like `https://back-your-boy.vercel.app`.

### 3) Lock down CORS (recommended)

Back on Render, set the `ALLOWED_ORIGINS` env var to your Vercel URL and redeploy:

```
ALLOWED_ORIGINS=https://back-your-boy.vercel.app
```

Share the Vercel link with your friends and play. 🎉

---

## ⚙️ Environment variables

| Where | Variable | Purpose |
| --- | --- | --- |
| Frontend | `VITE_API_URL` | Base URL of the backend (the WebSocket URL is derived from it) |
| Frontend | `VITE_WS_URL` | _Optional._ Override the WebSocket URL explicitly |
| Backend | `ALLOWED_ORIGINS` | Comma-separated allowed origins for CORS (`*` by default) |
| Backend | `PORT` | Provided automatically by the host |

---

## 📁 Project structure

```
BackYourBoy/
├── backend/
│   ├── main.py              # FastAPI app: REST + WebSocket endpoints
│   ├── requirements.txt
│   └── app/
│       ├── socket_manager.py  # Game state machine + connection manager
│       └── categories.py      # Themed category packs
├── frontend/
│   └── src/
│       ├── App.jsx            # Routing between game screens + WS client
│       ├── components/        # Screens (Lobby, Auction, Gameplay, …) + Mascot/FX
│       └── lib/               # config (URLs) + sound engine
├── render.yaml               # Render blueprint (backend)
└── frontend/vercel.json      # Vercel config (frontend)
```

---

## 🗺️ Adding categories

Open `backend/app/categories.py` and add prompts to any pack's `tasks` list, or add a whole new pack to the `PACKS` dict — it shows up automatically in the lobby's pack picker.

---

## 🤝 Contributing

Issues and PRs welcome! Fun directions: more category packs, new power-ups, persistent leaderboards, spectator mode, or theme packs.

## 📜 License

[MIT](./LICENSE) — do whatever, have fun.
