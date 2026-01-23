/* ======================================================
   JARVIS INTENT ENGINE
   File: core/intent.js
   Role: Understand user meaning
====================================================== */

const Intent = {};

/* ==========================
   INTENT DEFINITIONS
========================== */

Intent.map = {

  greeting: [
    "hi", "hello", "hey", "yo", "hola",
    "namaste", "ram ram", "salam",
    "hey jarvis", "hi jarvis", "hello jarvis"
  ],

  identity: [
    "who are you", "what are you",
    "tera naam kya", "tum kaun ho",
    "what is your name", "your name"
  ],

  owner: [
    "who am i", "mera naam kya",
    "who is your owner", "tum kis ke ho"
  ],

  mood: [
    "how are you", "kaisa hai",
    "how you feeling", "sab thik",
    "kya haal hai"
  ],

  remember: [
    "remember", "yaad rakh",
    "note this", "save this",
    "yaad kar le"
  ],

  recall: [
    "what did i say", "yaad hai",
    "tell me again", "recall",
    "kya yaad hai"
  ],

  learning_on: [
    "learning on", "learn mode",
    "seekh", "learning start"
  ],

  learning_off: [
    "learning off", "stop learning",
    "bas seekhna", "learning band"
  ]
};

/* ==========================
   MAIN DETECTOR
========================== */

Intent.detect = function (input) {

  if (!input) return null;

  // Normalize
  let clean = Intent.normalize(input);

  // Exact keyword match
  for (let intent in Intent.map) {
    for (let phrase of Intent.map[intent]) {
      if (clean.includes(phrase)) {
        return intent;
      }
    }
  }

  // Soft logic (context based)
  return Intent.smartGuess(clean);
};

/* ==========================
   NORMALIZATION
========================== */

Intent.normalize = function (text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/* ==========================
   SMART GUESSING
========================== */

Intent.smartGuess = function (text) {

  // Question detection
  if (text.startsWith("who") || text.startsWith("what")) {
    return "identity";
  }

  // Mood vibes
  if (text.includes("feel") || text.includes("haal")) {
    return "mood";
  }

  // Memory-like patterns
  if (text.includes("i like") || text.includes("i love")) {
    return "remember";
  }

  // Owner reference
  if (text.includes("my name")) {
    return "owner";
  }

  return null;
};

/* ==========================
   DEBUG TOOL
========================== */

Intent.debug = function (text) {
  console.log("INPUT:", text);
  console.log("NORMAL:", Intent.normalize(text));
  console.log("INTENT:", Intent.detect(text));
};