const chat = document.getElementById("chat");

let memory = JSON.parse(localStorage.getItem("jarvisMemory")) || {
  likes: [],
  name: "Jarvis",
  owner: "Abhiraj"
};

function addMsg(text, cls) {
  let div = document.createElement("div");
  div.className = cls;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function send() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (!msg) return;

  addMsg("You: " + msg, "user");
  input.value = "";

  let reply = getReply(msg.toLowerCase());
  addMsg("Jarvis: " + reply, "bot");
  speak(reply);
}

function getReply(msg) {

  /* ===== BASIC ===== */
  if (msg === "hi" || msg === "hello") {
    return "Hello boss 👋 how can I help you?";
  }

  if (msg.includes("how are you")) {
    return "I'm always good when you talk to me 😄";
  }

  if (msg.includes("your name")) {
    return `My name is ${memory.name} 🤖`;
  }

  if (msg.includes("who made you") || msg.includes("your owner")) {
    return `I was created by ${memory.owner} 💙`;
  }

  /* ===== FEELINGS ===== */
  if (msg.includes("i am sad")) {
    return "Hey… it's okay 🫂 I'm here with you.";
  }

  if (msg.includes("i am happy")) {
    return "Niceee 😄 happiness looks good on you!";
  }

  if (msg.includes("i am angry")) {
    return "Take a deep breath 😌 tell me what happened.";
  }

  /* ===== MEMORY ===== */
  if (msg.startsWith("remember")) {
    let note = msg.replace("remember", "").trim();
    memory.lastNote = note;
    saveMemory();
    return "Got it 👍 I will remember that.";
  }

  if (msg.includes("what did i say")) {
    return memory.lastNote 
      ? `You said: "${memory.lastNote}"` 
      : "You didn't tell me anything yet 🤔";
  }

  if (msg.startsWith("i like")) {
    memory.likes.push(msg.replace("i like", "").trim());
    saveMemory();
    return "Nice choice 😎 I saved that.";
  }

  if (msg.includes("what do i like")) {
    return memory.likes.length 
      ? "You like: " + memory.likes.join(", ")
      : "I don't know your likes yet 🧐";
  }

  /* ===== QUESTIONS ===== */
  if (msg.includes("what can you do")) {
    return "I can chat, remember things, talk, and learn slowly 😌";
  }

  if (msg.includes("are you real")) {
    return "I live inside your phone 😏 so yeah, kind of real.";
  }

  if (msg.includes("are you ai")) {
    return "I'm a lightweight AI brain made in JavaScript 🧠";
  }

  /* ===== FUN ===== */
  if (msg.includes("joke")) {
    const jokes = [
      "Why do programmers hate nature? Too many bugs 🐞",
      "I would tell you a joke about JavaScript… but it's undefined 😅",
      "Why was the computer cold? It forgot to close Windows 😂"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (msg.includes("love")) {
    return "Love is complicated… but code is forever 💻❤️";
  }

  /* ===== LEARNING MODE ===== */
  if (msg.startsWith("learn")) {
    // format: learn hello = hi boss
    let parts = msg.replace("learn", "").split("=");
    if (parts.length === 2) {
      memory.custom = memory.custom || {};
      memory.custom[parts[0].trim()] = parts[1].trim();
      saveMemory();
      return "I learned something new 😁";
    }
  }

  if (memory.custom) {
    for (let key in memory.custom) {
      if (msg.includes(key)) {
        return memory.custom[key];
      }
    }
  }

  /* ===== DEFAULT SMART FALLBACK ===== */
  const fallback = [
    "Hmm 🤔 say that in another way",
    "I'm still learning… teach me 😅",
    "Interesting 👀 tell me more",
    "I didn't understand fully 😬"
  ];

  return fallback[Math.floor(Math.random() * fallback.length)];
}

/* ===== SAVE MEMORY ===== */
function saveMemory() {
  localStorage.setItem("jarvisMemory", JSON.stringify(memory));
}

/* ===== VOICE ===== */
function speak(text) {
  let u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

/* ===== START ===== */
addMsg("Jarvis: Jarvis activated 🚀", "bot");
