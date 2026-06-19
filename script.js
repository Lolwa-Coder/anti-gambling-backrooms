// THE HOUSE ALWAYS WINS — anti-gambling demo.
// Every payout below uses the real-world math. The edge is the message.

const START = 1000;
let balance = START;
let totalWon = 0;
let totalLost = 0;
let bets = 0;

const $ = (id) => document.getElementById(id);
const fmt = (n) => "$" + Math.round(n).toLocaleString();

function render() {
  const bal = $("balance");
  bal.textContent = fmt(balance);
  bal.classList.toggle("low", balance < START * 0.5);

  const net = balance - START;
  $("net").textContent = "Net: " + (net >= 0 ? "+" : "−") + fmt(Math.abs(net));

  $("stat-spins").textContent = bets;
  $("stat-won").textContent = fmt(totalWon);
  $("stat-lost").textContent = fmt(totalLost);
  $("stat-house").textContent = fmt(totalLost - totalWon);

  const note = $("ledger-note");
  if (balance <= 0) {
    note.textContent = "You're out of money. The house is not. That is how it was designed.";
  } else if (bets >= 10) {
    const edge = bets ? ((totalLost - totalWon) / (totalWon + totalLost) * 100) : 0;
    note.textContent = `After ${bets} bets the house has taken ${fmt(totalLost - totalWon)} from you. The longer you play, the closer this gets to certainty.`;
  }
}

function canBet(amount) {
  if (balance < amount) {
    alert("Not enough balance. Notice how easy it was to get here.");
    return false;
  }
  return true;
}

// settle a bet: stake already implicitly wagered; payout is total returned (0 = total loss)
function settle(stake, payout, resultEl, message) {
  bets++;
  balance += payout - stake;
  if (payout >= stake) {
    totalWon += payout - stake;
    resultEl.className = "result win";
  } else {
    totalLost += stake - payout;
    resultEl.className = "result lose";
  }
  resultEl.textContent = message;
  render();
  if (balance <= 0) document.getElementById("reality").scrollIntoView({ behavior: "smooth" });
}

/* ---------- SLOT MACHINE ----------
   3 reels, 8 symbols. Honest ~92% RTP — typical of real machines. */
const SYMBOLS = ["🍒", "🔔", "💎", "🍋", "⭐", "7️⃣", "🍇", "🪙"];
const PAYOUTS = { "🍒": 3, "🔔": 5, "💎": 12, "🍋": 3, "⭐": 8, "7️⃣": 20, "🍇": 4, "🪙": 6 };
let slotsBusy = false;

function playSlots(stake) {
  if (slotsBusy || !canBet(stake)) return;
  slotsBusy = true;
  const reels = [$("reel0"), $("reel1"), $("reel2")];
  reels.forEach((r) => r.classList.add("spin"));
  $("slots-result").className = "result";
  $("slots-result").textContent = "Spinning...";

  const final = reels.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);

  reels.forEach((r, i) => {
    setTimeout(() => {
      r.classList.remove("spin");
      r.textContent = final[i];
      if (i === 2) finishSlots(stake, final);
    }, 600 + i * 350);
  });
}

function finishSlots(stake, final) {
  slotsBusy = false;
  let payout = 0, msg;
  if (final[0] === final[1] && final[1] === final[2]) {
    payout = stake * PAYOUTS[final[0]];
    msg = `THREE ${final[0]}! You won ${fmt(payout)}. Feels good — that's the hook.`;
  } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
    payout = Math.floor(stake * 0.5); // "near win" partial refund — keeps you playing
    msg = `So close! A tiny ${fmt(payout)} back. "Almost" is the most profitable word in gambling.`;
  } else {
    payout = 0;
    msg = `Nothing. You lost ${fmt(stake)}.`;
  }
  settle(stake, payout, $("slots-result"), msg);
}

/* ---------- ROULETTE ----------
   American wheel: 18 red, 18 black, 2 green (0, 00) => 47.4% win on an even-money bet. */
let rouletteBusy = false;
function buildWheel() {
  const w = $("wheel");
  const slices = [];
  for (let i = 0; i < 38; i++) {
    let color = i < 18 ? "#8a1f1f" : i < 36 ? "#1a1a1a" : "#1a7a43";
    const start = (360 / 38) * i;
    const end = (360 / 38) * (i + 1);
    slices.push(`${color} ${start}deg ${end}deg`);
  }
  w.style.background = `conic-gradient(${slices.join(",")})`;
}
buildWheel();

function playRoulette(stake, pick) {
  if (rouletteBusy || !canBet(stake)) return;
  rouletteBusy = true;
  $("roulette-result").className = "result";
  $("roulette-result").textContent = "No more bets...";

  const slot = Math.floor(Math.random() * 38); // 0-17 red, 18-35 black, 36/37 green
  const color = slot < 18 ? "red" : slot < 36 ? "black" : "green";
  const sliceAngle = 360 / 38;
  const target = 360 * 5 + (360 - (slot * sliceAngle + sliceAngle / 2));
  $("wheel").style.transform = `rotate(${target}deg)`;

  setTimeout(() => {
    rouletteBusy = false;
    $("wheel").style.transition = "none";
    $("wheel").style.transform = `rotate(${target % 360}deg)`;
    requestAnimationFrame(() => ($("wheel").style.transition = ""));

    let payout = 0, msg;
    if (color === "green") {
      msg = `GREEN ZERO. Everyone loses. You lost ${fmt(stake)}. This pocket is the entire business model.`;
    } else if (color === pick) {
      payout = stake * 2;
      msg = `${color.toUpperCase()}! You won ${fmt(stake)}. But you only had a 47.4% shot, not 50%.`;
    } else {
      msg = `${color.toUpperCase()}. You picked ${pick}. Lost ${fmt(stake)}.`;
    }
    settle(stake, payout, $("roulette-result"), msg);
  }, 3600);
}

/* ---------- THE CRASH ----------
   Multiplier climbs; crash point drawn so the house keeps ~5%.
   P(crash before x) follows a heavy tail; you almost never cash out in time. */
let crashTimer = null, crashMulti = 1, crashStake = 0, crashPoint = 0, crashFlying = false;

function startCrash(stake) {
  if (crashFlying || !canBet(stake)) return;
  crashFlying = true;
  crashStake = stake;
  crashMulti = 1;
  // house edge: 4% instant bust, otherwise crash at 0.96 / U  (median ~1.9x)
  crashPoint = Math.random() < 0.04 ? 1.0 : 0.96 / Math.random();

  $("crash-start").disabled = true;
  $("crash-cashout").disabled = false;
  const disp = $("crash-multi");
  disp.classList.remove("crashed");
  $("crash-result").className = "result";
  $("crash-result").textContent = "Climbing... do you trust it?";

  crashTimer = setInterval(() => {
    crashMulti = +(crashMulti * 1.03).toFixed(2);
    disp.textContent = crashMulti.toFixed(2) + "x";
    if (crashMulti >= crashPoint) {
      clearInterval(crashTimer);
      disp.textContent = "CRASHED";
      disp.classList.add("crashed");
      crashFlying = false;
      $("crash-start").disabled = false;
      $("crash-cashout").disabled = true;
      settle(crashStake, 0, $("crash-result"),
        `Crashed at ${crashPoint.toFixed(2)}x. You lost ${fmt(crashStake)}. Greed is the product they sell.`);
    }
  }, 120);
}

function cashOut() {
  if (!crashFlying) return;
  clearInterval(crashTimer);
  crashFlying = false;
  $("crash-start").disabled = false;
  $("crash-cashout").disabled = true;
  const payout = Math.floor(crashStake * crashMulti);
  settle(crashStake, payout, $("crash-result"),
    `Cashed out at ${crashMulti.toFixed(2)}x for ${fmt(payout)}. Smart. Now try to do it every single time.`);
}

/* ---------- wire up ---------- */
document.querySelectorAll(".bet-btn[data-game]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const stake = +btn.dataset.bet;
    switch (btn.dataset.game) {
      case "slots": playSlots(stake); break;
      case "roulette": playRoulette(stake, btn.dataset.pick); break;
      case "crash": startCrash(stake); break;
    }
  });
});
$("crash-cashout").addEventListener("click", cashOut);

render();
