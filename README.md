# THE HOUSE ALWAYS WINS

An **anti-gambling** web experience. Three gambling machines — slots, roulette, and a "crash" game — built with the *real-world math*, so the built-in house edge is plain to see. Play long enough and the outcome isn't luck; it's arithmetic.

**▶ Live demo: https://lolwa-coder.github.io/anti-gambling-backrooms/**

## Two versions
- **3D Backrooms** (`index.html`) — a first-person liminal yellow room rendered in [Three.js](https://threejs.org/). Walk up to glossy, rounded consoles and play. The lights bleed red as your balance drains, manipulative "reasons to gamble" are scrawled across the walls in blood, and a grim reaper greets you at $0.
- **Classic 2D** (`classic.html`) — the original single-page version with the same three machines and an honest ledger.

## The point
Every machine is mathematically honest about how it's rigged:
- **Slots** — ~92% real return, plus the "near-miss" partial refund that keeps players hooked.
- **Roulette** — American wheel with **two green zeros**, so an "even-money" bet really wins 47.4%, not 50%.
- **Crash** — the multiplier is drawn so the house keeps ~5%; you almost never cash out in time.

A live ledger tracks total won, lost, and **house profit** — the number that only ever trends one way.

## Controls (3D)
- **WASD / arrows** — walk
- **Drag the mouse** — look around
- Walk up to a machine and use the on-screen buttons

## If gambling has stopped being fun
This is not a game in real life. Help is free, confidential, and available 24/7:
- **US:** 1-800-522-4700 — National Problem Gambling Helpline · [chat](https://www.ncpgambling.org/chat)
- **India:** 1800-599-0019 — KIRAN, Govt of India national mental-health helpline

## Tech
Plain HTML/CSS/JS. The 3D version loads Three.js and the *Pirata One* font from CDNs (needs an internet connection). No build step — open `index.html` or visit the live demo.

---

## Bonus: ZENGA — multiplayer tower game (`zenga.html`)
A 3D, physics-based Jenga you play with friends — **no server needed**. One player hosts and runs the authoritative physics simulation; everyone else connects directly over WebRTC and renders the broadcast state.

- **Host** a game, then share the generated link (or host code) with friends.
- **Join** by pasting the host code, or open a `?host=…` link to auto-fill it.
- Take turns: drag a block to slide it out, move it on top, and click to drop. Topple the tower and the round is yours to lose.

Tech: [Three.js](https://threejs.org/) (rendering) · [cannon-es](https://github.com/pmndrs/cannon-es) (physics) · [PeerJS](https://peerjs.com/) (peer-to-peer WebRTC). All from CDNs, fully static — works on GitHub Pages.
