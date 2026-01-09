hereconst PASSWORD = "abhi.ai";
let learning = null;

const chat = document.getElementById("chat");
const input = document.getElementById("input");

// ---------- LOGIN ----------
function login() {
  if (document.getElementById("password").value === PASSWORD) {
    document.getElementById("login").hidden = true;
    document.getElementById("app").hidden = false;
    speak("Jarvis ready boss");
  } else {
    alert("Wrong password");
  }
}

// ---------- FACE ----------
const canvas = document.getElementById("face");
const ctx = canvas.getContext("2d");

function drawFace(talk=false) {
  ctx.clearRect(0,0,200,200);
  ctx.fillStyle = "cyan";
  ctx.beginPath(); ctx.arc(70,80,10,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(130,80,10,0,Math.PI*2); ctx.fill();

  ctx.fillStyle = talk ? "red" : "black";
  ctx.beginPath(); ctx.arc(100,130,15,0,Math.PI); ctx.fill();
}

drawFace();

// ---------- SPEAK ----------
function speak(text) {
  drawFace(true);
  let u = new SpeechSynthesisUtterance(text);
  u.onend = () => drawFace(false);
  speechSynthesis.speak(u);
}

// ---------- CHAT ----------
function add(who, text) {
  chat.innerHTML += `<b>${who}:</b> ${text}<br>`;
  chat.scrollTop = chat.scrollHeight;
}

// ---------- SEND ----------
function send(text=null) {
  let msg = text || input.value;
  if (!msg) return;

  add("You", msg);
  input.value = "";

  // Learning mode
  if (learning) {
    localStorage.setItem("learn_" + learning, msg);
    speak("Saved boss");
    add("Jarvis", "Saved");
    learning = null;
    return;
  }

  // Learned replies
  for (let k in localStorage) {
    if (msg.toLowerCase().includes(k.replace("learn_",""))) {
      let r = localStorage.getItem(k);
      add("Jarvis", r);
      speak(r);
      return;
    }
  }

  if (msg.startsWith("learn")) {
    learning = msg.replace("learn","").trim();
    add("Jarvis", "What should I reply?");
    speak("What should I reply?");
    return;
  }

  let reply = "I am learning boss 😄";
  add("Jarvis", reply);
  speak(reply);
}

// ---------- SAVE BUTTON ----------
function save() {
  speak("Already saved boss");
}

// ---------- VOICE INPUT ----------
function voice() {
  let r = new webkitSpeechRecognition();
  r.lang = "en-IN";
  r.onresult = e => send(e.results[0][0].transcript);
  r.start();
  }
