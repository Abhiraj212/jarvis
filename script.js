let chat = document.getElementById("chat");
let userInput = document.getElementById("userInput");

let memory = {
  name: "Abhi",
  likes: [],
  notes: []
};

// ===== LOAD MEMORY =====
function loadMemory() {
  let saved = localStorage.getItem("jarvis_memory");
  if (saved) memory = JSON.parse(saved);
}
loadMemory();

// ===== SAVE MEMORY =====
function saveMemory() {
  localStorage.setItem("jarvis_memory", JSON.stringify(memory));
}

// ===== SPEAK =====
function speak(text) {
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  speechSynthesis.speak(msg);
  addMsg("Jarvis", text);
}

// ===== CHAT UI =====
function addMsg(who, text) {
  let div = document.createElement("div");
  div.className = "msg " + (who === "You" ? "user" : "jarvis");
  div.innerText = who + ": " + text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ===== TEXT INPUT =====
function sendText() {
  let text = userInput.value;
  if (!text) return;
  addMsg("You", text);
  userInput.value = "";
  handleInput(text.toLowerCase());
}

// ===== VOICE INPUT =====
let recognition;
function startMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-IN";

  recognition.onresult = (e) => {
    let text = e.results[0][0].transcript;
    addMsg("You", text);
    handleInput(text.toLowerCase());
  };

  recognition.start();
}

// ===== AI LOGIC =====
function handleInput(text) {

  if (text.includes("hello") || text.includes("hi")) {
    speak("Hello boss 😎");
  }

  else if (text.includes("my name")) {
    speak("Your name is " + memory.name);
  }

  else if (text.includes("i like")) {
    let like = text.replace("i like", "").trim();
    memory.likes.push(like);
    saveMemory();
    speak("Okay, you like " + like);
  }

  else if (text.includes("what do i like")) {
    speak("You like " + memory.likes.join(", "));
  }

  else if (text.includes("remember")) {
    let note = text.replace("remember", "").trim();
    memory.notes.push(note);
    saveMemory();
    speak("Saved in memory");
  }

  else if (text.includes("what did i say")) {
    speak("Last thing you said was " + memory.notes[memory.notes.length - 1]);
  }

  else {
    speak("I am learning boss 🤖");
  }
}

// ===== CAMERA =====
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
  document.getElementById("camera").srcObject = stream;
});

// ===== START =====
speak("Jarvis online boss 🔥");