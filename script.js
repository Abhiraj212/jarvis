// ========================
// JARVIS CORE CONFIG
// ========================
const JARVIS_NAME = "Jarvis";
let voiceEnabled = true;

// Load memory
let memory = JSON.parse(localStorage.getItem("jarvisMemory")) || [];

// ========================
// CHAT SYSTEM
// ========================
const chat = document.getElementById("chat");

function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.innerText = (who === "user" ? "You: " : "Jarvis: ") + text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    if (who === "jarvis" && voiceEnabled) speak(text);
}

// ========================
// VOICE OUTPUT (WEB)
// ========================
function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
}

// ========================
// SEND MESSAGE
// ========================
function send() {
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;

    addMsg(text, "user");
    input.value = "";

    process(text.toLowerCase());
}

// ========================
// COMMAND & AI LOGIC
// ========================
function process(msg) {

    // ---- COMMANDS ----
    if (msg === "clear memory") {
        memory = [];
        saveMemory();
        addMsg("Memory cleared.", "jarvis");
        return;
    }

    if (msg === "what is my name") {
        const name = memory.find(m => m.key === "name");
        addMsg(name ? "Your name is " + name.value : "I don't know yet.", "jarvis");
        return;
    }

    if (msg.startsWith("my name is")) {
        const name = msg.replace("my name is", "").trim();
        remember("name", name);
        addMsg("Got it. I'll remember your name.", "jarvis");
        return;
    }

    // ---- LEARNING ----
    if (msg.startsWith("remember")) {
        const data = msg.replace("remember", "").trim();
        remember("note", data);
        addMsg("Saved this in memory.", "jarvis");
        return;
    }

    // ---- SEARCH MEMORY ----
    if (msg.includes("what did i say")) {
        addMsg(memory.map(m => m.value).join(", ") || "Nothing yet.", "jarvis");
        return;
    }

    // ---- DEFAULT AI REPLY ----
    addMsg(defaultReply(msg), "jarvis");
}

// ========================
// MEMORY SYSTEM
// ========================
function remember(key, value) {
    memory.push({ key, value });
    saveMemory();
}

function saveMemory() {
    localStorage.setItem("jarvisMemory", JSON.stringify(memory));
}

// ========================
// BASIC AI BRAIN
// ========================
function defaultReply(msg) {
    if (msg.includes("hello")) return "Hello! I'm active.";
    if (msg.includes("how are you")) return "I'm running perfectly.";
    if (msg.includes("your name")) return "My name is " + JARVIS_NAME;
    return "I heard you. I'm still learning.";
}

// ========================
// VOICE TOGGLE
// ========================
function speakToggle() {
    voiceEnabled = !voiceEnabled;
    alert("Voice " + (voiceEnabled ? "ON" : "OFF"));
}
