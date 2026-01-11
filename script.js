const chat = document.getElementById("chat");
const input = document.getElementById("input");

// ---------- FACE ----------
const canvas = document.getElementById("face");
const ctx = canvas.getContext("2d");

function drawFace(talk=false) {
  ctx.clearRect(0,0,200,200);

  // eyes
  ctx.fillStyle = "cyan";
  ctx.beginPath(); ctx.arc(70,80,10,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(130,80,10,0,Math.PI*2); ctx.fill();

  // mouth
  ctx.fillStyle = talk ? "red" : "white";
  ctx.beginPath(); ctx.arc(100,130,15,0,Math.PI); ctx.fill();
}

drawFace();

// ---------- SPEAK ----------
function speak(text) {
  drawFace(true);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  u.onend = () => drawFace(false);
  speechSynthesis.speak(u);
}

// ---------- CHAT ----------
function add(who, msg) {
  chat.innerHTML += `<b>${who}:</b> ${msg}<br>`;
  chat.scrollTop = chat.scrollHeight;
}

// ---------- SEND ----------
function send(text=null) {
  const msg = text || input.value.trim();
  if (!msg) return;

  add("You", msg);
  input.value = "";

  // learned replies
  let reply = localStorage.getItem("learn_" + msg.toLowerCase());

  if (!reply) {
    reply = "I am learning boss 😄";
  }

  add("Jarvis", reply);
  speak(reply);
}

// ---------- VOICE INPUT ----------
function voice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice not supported in this browser");
    return;
  }

  const r = new webkitSpeechRecognition();
  r.lang = "en-IN";
  r.onresult = e => send(e.results[0][0].transcript);
  r.start();
}

// ---------- ENTER KEY ----------
window.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});

// ---------- LEARNING ----------
// format: learn hello = Hello boss
input.placeholder = "Type: learn hello = Hello boss 😎";

input.addEventListener("change", () => {
  const t = input.value;
  if (t.startsWith("learn ")) {
    const parts = t.replace("learn ","").split("=");
    if (parts.length === 2) {
      localStorage.setItem(
        "learn_" + parts[0].trim().toLowerCase(),
        parts[1].trim()
      );
      add("Jarvis", "Saved boss 😎");
      speak("Saved boss");
      input.value = "";
    }
  }
});

// ---------- AUTO START MESSAGE ----------
speak("Jarvis online boss");
add("Jarvis", "Jarvis online boss 😎");
