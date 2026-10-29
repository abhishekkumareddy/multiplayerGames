# Friends Arcade — Real-Time Multiplayer Gaming (Zero Database)

> **"Your Friends. Your Games. Your Fun."**  
> Create a room, invite your friends, and start playing instantly. Zero signup, zero lag, 100% in-memory fun!

---

## 🕹️ Project Overview

**Friends Arcade** is a modern, responsive arcade-style multiplayer website built for instant party play with friends. Users can browse a vibrant library of mini-games, create private rooms, invite friends via 6-character room codes or 1-click invitation links (`https://your-domain.com/?room=AB12CD`), and compete in real-time.

### 🚫 The Zero Database Constraint

This project operates with **zero database dependencies**:
- **NO** MySQL, MongoDB, PostgreSQL, SQLite, Firebase, Supabase, or Redis.
- Rooms, players, chat messages, scores, and active matches exist **exclusively in server RAM** using JavaScript `Map` objects and state machines.
- All game logic is **server-authoritative** — clients cannot manipulate game results, forge scores, or play out of turn.
- State is temporary and self-cleaning:
  - **Graceful Disconnection**: Disconnected players receive a 30-second grace window to reconnect with identical names.
  - **Host Reassignment**: If the host disconnects or leaves, host privileges automatically transfer to the next connected player.
  - **Abandoned Room Purging**: Empty rooms and inactive rooms (>1 hour) are automatically evicted by server-managed intervals.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with **Vite** & **TypeScript**
- **Tailwind CSS** with custom arcade theme palette (Navy, Electric Blue, Emerald, Amber, Coral Red)
- **Framer Motion** for smooth 60fps animations, layout transitions, and interactive feedback
- **Lucide React** for modern UI icons
- **Socket.IO Client** for persistent bi-directional real-time communication
- **Web Audio API** synthesizer (`client/src/utils/sound.ts`) for zero-asset arcade sound effects (clicks, moves, countdowns, victories)
- **Canvas-Confetti** for match celebrations

### Backend
- **Node.js** & **Express.js**
- **Socket.IO** (WebSockets with polling fallback)
- **TypeScript** / **TSX** runtime
- **In-Memory JavaScript Maps** for room and player state management
- **Node.js Native Test Runner** (`node:test`, `node:assert`) for unit and integration testing

---

## 🎮 The 6 Fully Functional Games

| # | Game | Players | Category | Description |
|---|---|---|---|---|
| 1 | **Tic-Tac-Toe** | 2 | Classic | 3x3 neon grid duel. Turn alternation, row/col/diagonal win detection, draw detection, rematch score tracking. |
| 2 | **Rock Paper Scissors** | 2 | Party | Simultaneous move selection (moves hidden until both players choose), 3-second reveal countdown, Best-of-5 round tracker. |
| 3 | **Connect Four** | 2 | Puzzle | 7x6 gravity board. Animated chip drops to lowest open slot, 4-in-a-row detection in 4 directions, column full guards. |
| 4 | **Memory Match** | 2-4 | Puzzle | 16-card grid with 3D flip animations. Finding matching pairs grants points and keeps your turn alive. |
| 5 | **Reaction Challenge** | 2-6 | Action | Synchronized red/yellow/green light countdown. False start penalty alarm. Milliseconds precision ranking and tournament points. |
| 6 | **Quick Quiz** | 2-8 | Party | Curated trivia questions with 12s countdown timer. Authoritative server answer check + speed bonus scoring + podium. |

---

## 📂 Project Structure

```text
MultiPlayerGames/
├── client/                     # Vite + React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/         # Navbar, Hero, GameCard, Modals, ChatDrawer
│   │   ├── games/              # 6 Independent React Game Components
│   │   │   ├── TicTacToeGame.tsx
│   │   │   ├── RockPaperScissorsGame.tsx
│   │   │   ├── ConnectFourGame.tsx
│   │   │   ├── MemoryMatchGame.tsx
│   │   │   ├── ReactionChallengeGame.tsx
│   │   │   └── QuickQuizGame.tsx
│   │   ├── hooks/              # useRoom (Socket.IO state & actions hook)
│   │   ├── pages/              # HomePage, RoomPage
│   │   ├── socket/             # socketClient.ts
│   │   ├── styles/             # Tailwind index.css
│   │   └── utils/              # sound.ts (Web Audio API synthesizer)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Node.js + Express + Socket.IO Backend
│   ├── src/
│   │   ├── config/             # constants.ts (TTL, ports, timeouts)
│   │   ├── games/              # Authoritative Game Engines
│   │   │   ├── BaseGameEngine.ts
│   │   │   ├── TicTacToeEngine.ts
│   │   │   ├── RockPaperScissorsEngine.ts
│   │   │   ├── ConnectFourEngine.ts
│   │   │   ├── MemoryMatchEngine.ts
│   │   │   ├── ReactionChallengeEngine.ts
│   │   │   ├── QuickQuizEngine.ts
│   │   │   └── quizQuestions.ts
│   │   ├── rooms/              # roomManager.ts (In-memory Room Manager)
│   │   ├── sockets/            # socketHandler.ts (Socket.IO event protocol)
│   │   └── server.ts           # Express HTTP + Socket.IO Server & SPA static hosting
│   ├── package.json
│   └── tsconfig.json
├── shared/                     # Shared TypeScript contracts & Game Metadata
│   ├── types.ts                # Room, Player, GameState, and Socket Event definitions
│   └── games.ts                # Metadata registry (categories, player limits, rules)
├── tests/                      # Automated unit, game engine, and e2e socket tests
│   ├── room-manager.test.js    # In-memory room creation, joining, capacity, grace period
│   ├── game-engines.test.js    # Validation & win checks for all 6 engines
│   └── e2e-socket.test.js      # Full real-time Socket.IO multiplayer game test
├── ecosystem.config.cjs        # PM2 deployment configuration
├── nginx.conf.example          # Reverse proxy with SSL & WebSocket upgrades
├── package.json                # Monorepo root scripts
├── .env.example
├── .gitignore
└── README.md
```

---

## 📡 Socket.IO Event Protocol

### Client ➔ Server
- `room:create` `{ playerName, avatar, gameId }` — Creates a room and assigns host.
- `room:join` `{ roomId, playerName, avatar }` — Validates code, capacity, and joins room.
- `room:leave` — Leaves current room.
- `player:ready` `{ isReady }` — Toggles ready status.
- `game:select` `{ gameId }` — (Host only) Selects or changes the active game.
- `game:start` — (Host only) Initiates game when minimum players and ready checks pass.
- `game:action` `{ action, payload }` — Submits a turn move or answer to the server.
- `game:rematch` — Casts vote for next round or match reset.
- `chat:send` `{ text }` — Sends room chat message or quick emoji reaction.

### Server ➔ Client
- `room:created` `{ roomId, room }` — Returned upon room creation.
- `room:joined` `{ roomId, room }` — Returned upon successful join.
- `room:updated` `Room` — Broadcast whenever players join, leave, ready up, or state changes.
- `room:error` `{ code, message }` — Structured error (e.g. `ROOM_NOT_FOUND`, `ROOM_FULL`, `INVALID_MOVE`).
- `game:state` `GameState` — Authoritative game state broadcast.
- `game:finished` `{ winner, scores, reason }` — Dispatched at game conclusion.
- `chat:message` `ChatMessage` — Broadcast chat and reaction updates.
- `player:disconnected` `{ socketId, roomId }` — Disconnect notice.

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js** 18+ (tested on Node v20/v22)
- **npm** 9+

### 2. Installation
```bash
git clone <repo-url>
cd MultiPlayerGames
npm install
```

### 3. Development Mode (Hot Reload)
Run frontend and backend simultaneously:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API & WebSockets: `http://localhost:3001`

### 4. Running Tests
Run the comprehensive automated test suite (unit tests, 6 game engines, and full Socket.IO E2E test):
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```
The Express server on port 3001 will serve both the compiled Vite SPA frontend from `client/dist` and the real-time WebSockets on the exact same port!

---

## 🌐 Hostinger Hosting & Deployment Guide

### Understanding Hostinger Plan Requirements for WebSockets

> [!IMPORTANT]
> **Persistent WebSockets Requirement**:  
> Real-time multiplayer gaming requires a persistent, long-running Node.js process and continuous WebSocket connections (`Upgrade: websocket`).
>
> - **Hostinger Shared Web Hosting (Standard/Premium/Business Shared)**:  
>   Runs behind Apache/LiteSpeed FastCGI with execution timeout limits (typically 30–60 seconds). These plans **cannot** sustain persistent WebSockets or in-memory server state.
> - **Hostinger VPS (KVM VPS) / Cloud Hosting**:  
>   Provides a full Ubuntu/Debian environment with root access, allowing persistent Node.js processes via **PM2** or **systemd**, and **Nginx** reverse proxying with WebSockets upgrade headers.

### Deployment Path A: Hostinger KVM VPS (Recommended — Unified Single Process)

In this configuration, your Node.js Express server serves both the React production frontend and the Socket.IO WebSockets on the same port behind Nginx with Let's Encrypt SSL.

#### Step 1: Connect to your Hostinger VPS
```bash
ssh root@your_vps_ip
```

#### Step 2: Install Node.js & Nginx
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2 tsx
```

#### Step 3: Clone and Build
```bash
cd /var/www
git clone <your-repository-url> friends-arcade
cd friends-arcade
npm install
npm run build
```

#### Step 4: Configure PM2 for Automatic Restarts
Use the included `ecosystem.config.cjs`:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx & SSL
Copy the provided `nginx.conf.example`:
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/friends-arcade
sudo nano /etc/nginx/sites-available/friends-arcade # replace your-domain.com with your actual domain
sudo ln -s /etc/nginx/sites-available/friends-arcade /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Install free SSL certificate with Certbot:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Deployment Path B: Hostinger Shared Hosting (Decoupled Frontend + VPS Backend)

If you only have Hostinger Shared Hosting:
1. Build the frontend locally or on GitHub Actions:
   ```bash
   VITE_SOCKET_URL=https://api.yourdomain.com npm run build:client
   ```
2. Upload the contents of `client/dist/` to your Hostinger Shared Hosting `public_html/` via File Manager or FTP.
3. Add a `.htaccess` file in `public_html/` to support SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
4. Host the Node.js backend on a compatible Node.js VPS or cloud service (e.g. Hostinger VPS, Render, Railway, Fly.io).

---

## 🔒 Security & Fair Play Highlights

- **Server-Authoritative Validation**: No client can declare itself the winner or report fabricated scores.
- **Out-of-Turn Prevention**: Moves made when it is not a player's turn are strictly rejected with `INVALID_MOVE`.
- **Hidden Moves (RPS & Quiz)**: Opponents cannot sniff upcoming moves over the wire; choices and trivia answers remain masked on the server until the reveal phase.
- **Rate-Limiting & Memory Guards**: Room IDs and players are capped; idle rooms are cleanly garbage collected.
