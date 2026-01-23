/* ======================================================
   JARVIS CORE BRAIN
   File: core/brain.js
   Role: Central intelligence controller
   Author: Abhi 😎
====================================================== */

/* ==========================
   GLOBAL BRAIN STATE
========================== */

const Brain = {

  system: {
    name: "Jarvis",
    owner: "Abhi",
    version: "1.0.0",
    mode: "normal",     // normal | silent | learning
    online: true
  },

  mood: {
    current: "neutral",
    energy: 0.7,        // 0.0 – 1.0
    friendliness: 0.8
  },

  context: {
    lastInput: "",
    lastReply: "",
    topic: null,
    history: []
  },

  limits: {
    maxHistory: 30,
    maxContextTokens: 2000
  }
};

/* ==========================
   INITIALIZATION
========================== */

Brain.init = function () {
  console.log("🧠 Brain initializing...");

  if (typeof Memory !== "undefined") {
    Memory.init();
  }

  Brain.loadProfile();
  Brain.bootMessage();
};

/* ==========================
   PROFILE LOADING
========================== */

Brain.loadProfile = function () {
  let profile = localStorage.getItem("jarvis_profile");
  if (profile) {
    try {
      let data = JSON.parse(profile);
      Brain.system.owner = data.owner || Brain.system.owner;
      Brain.system.name = data.name || Brain.system.name;
    } catch (e) {
      console.warn("Profile load failed");
    }
  }
};

/* ==========================
   BOOT MESSAGE
========================== */

Brain.bootMessage = function () {
  if (typeof Reply !== "undefined") {
    Reply.say(`System online. Hello ${Brain.system.owner}.`);
  }
};

/* ==========================
   MAIN INPUT ENTRY
========================== */

Brain.processInput = function (text, source = "text") {

  if (!text || text.trim() === "") return;

  text = text.toLowerCase().trim();

  Brain.context.lastInput = text;
  Brain.pushHistory("user", text);

  // Detect intent
  let intent = Intent.detect(text);

  if (!intent) {
    Brain.handleUnknown(text);
    return;
  }

  Brain.executeIntent(intent, text);
};

/* ==========================
   HISTORY MANAGEMENT
========================== */

Brain.pushHistory = function (role, text) {
  Brain.context.history.push({
    role: role,
    text: text,
    time: Date.now()
  });

  if (Brain.context.history.length > Brain.limits.maxHistory) {
    Brain.context.history.shift();
  }
};

/* ==========================
   INTENT EXECUTION
========================== */

Brain.executeIntent = function (intent, text) {

  Brain.context.topic = intent;

  switch (intent) {

    case "greeting":
      Reply.sayRandom([
        "Hello boss 😎",
        "Hey! I’m here.",
        "Hi Abhi, what’s up?"
      ]);
      break;

    case "identity":
      Reply.say(`I am ${Brain.system.name}, your assistant.`);
      break;

    case "owner":
      Reply.say(`You are ${Brain.system.owner}.`);
      break;

    case "mood":
      Reply.say(`I am feeling ${Brain.mood.current}.`);
      break;

    case "remember":
      Brain.remember(text);
      break;

    case "recall":
      Brain.recall();
      break;

    case "learning_on":
      Brain.system.mode = "learning";
      Reply.say("Learning mode activated.");
      break;

    case "learning_off":
      Brain.system.mode = "normal";
      Reply.say("Learning mode off.");
      break;

    default:
      Brain.handleUnknown(text);
  }
};

/* ==========================
   MEMORY ACTIONS
========================== */

Brain.remember = function (text) {
  let clean = text.replace("remember", "").trim();
  if (!clean) {
    Reply.say("What should I remember?");
    return;
  }

  if (typeof Memory !== "undefined") {
    Memory.saveNote(clean);
    Reply.say("Saved in memory 🧠");
  } else {
    Reply.say("Memory system not available.");
  }
};

Brain.recall = function () {
  if (typeof Memory !== "undefined") {
    let last = Memory.lastNote();
    Reply.say(last || "Nothing remembered yet.");
  }
};

/* ==========================
   UNKNOWN INPUT HANDLER
========================== */

Brain.handleUnknown = function (text) {

  Brain.mood.energy -= 0.01;
  if (Brain.mood.energy < 0) Brain.mood.energy = 0;

  if (Brain.system.mode === "learning") {
    if (typeof Memory !== "undefined") {
      Memory.saveUnknown(text);
    }
    Reply.say("I saved this to learn later.");
  } else {
    Reply.sayRandom([
      "Hmm… I’m not sure yet.",
      "I didn’t fully understand that.",
      "Say it differently?"
    ]);
  }
};

/* ==========================
   CONTEXT UTILITIES
========================== */

Brain.getRecentContext = function (count = 5) {
  return Brain.context.history.slice(-count);
};

Brain.clearContext = function () {
  Brain.context.history = [];
  Brain.context.topic = null;
};

/* ==========================
   SYSTEM COMMANDS
========================== */

Brain.shutdown = function () {
  Brain.system.online = false;
  Reply.say("System shutting down.");
};

Brain.restart = function () {
  Reply.say("Restarting system.");
  location.reload();
};

/* ==========================
   DEBUG (OPTIONAL)
========================== */

Brain.debug = function () {
  console.table(Brain.context.history);
};

/* ==========================
   AUTO INIT
========================== */

setTimeout(() => {
  Brain.init();
}, 100);