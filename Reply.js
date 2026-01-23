/* ======================================================
   JARVIS REPLY ENGINE
   File: core/reply.js
   Role: Talking, personality, tone, emotion
====================================================== */

const Reply = {};

/* ==========================
   CORE SETTINGS
========================== */

Reply.config = {
  typingDelay: 20,
  randomize: true,
  emojiChance: 0.3,
  followUpChance: 0.25
};

/* ==========================
   PERSONALITY PROFILE
========================== */

Reply.personality = {
  friendly: 0.8,
  sarcastic: 0.2,
  serious: 0.3,
  playful: 0.7
};

/* ==========================
   RESPONSE BANK
========================== */

Reply.bank = {

  greeting: [
    "Hey 😎",
    "Hello boss 👋",
    "Yo, I’m here",
    "Namaste 🙏",
    "What’s up?"
  ],

  identity: [
    "I’m Jarvis. Built just for you.",
    "Your personal assistant 😌",
    "Jarvis here. Always online.",
    "I exist to help you."
  ],

  mood: [
    "All good 😄",
    "Running smooth ⚡",
    "Feeling productive today",
    "Chilling, but ready"
  ],

  unknown: [
    "Hmm… didn’t catch that.",
    "Say that again?",
    "I’m still learning 🤔",
    "That went over my head."
  ],

  learning: [
    "Got it. I’ll remember that 🧠",
    "Saved.",
    "Noted.",
    "Okay, stored for later."
  ]
};

/* ==========================
   MAIN SAY FUNCTION
========================== */

Reply.say = function (text) {
  Reply.pushBotHistory(text);
  Reply.display(text);
  Reply.voice(text);
};

/* ==========================
   RANDOM SAY
========================== */

Reply.sayRandom = function (list) {
  if (!Array.isArray(list)) return;
  let text = list[Math.floor(Math.random() * list.length)];
  Reply.say(Reply.decorate(text));
};

/* ==========================
   DECORATION (EMOJIS ETC)
========================== */

Reply.decorate = function (text) {
  if (Math.random() < Reply.config.emojiChance) {
    return text + " " + Reply.randomEmoji();
  }
  return text;
};

Reply.randomEmoji = function () {
  const emojis = ["😎", "🔥", "🙂", "🤖", "✨", "⚡"];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

/* ==========================
   DISPLAY (GUI)
========================== */

Reply.display = function (text) {
  if (typeof UI !== "undefined") {
    UI.addMessage("bot", text);
  } else {
    console.log("Jarvis:", text);
  }
};

/* ==========================
   VOICE OUTPUT
========================== */

Reply.voice = function (text) {
  if (typeof Voice !== "undefined") {
    Voice.speak(text);
  }
};

/* ==========================
   FOLLOW-UP LOGIC
========================== */

Reply.followUp = function () {
  if (Math.random() > Reply.config.followUpChance) return;

  const followUps = [
    "Anything else?",
    "What’s next?",
    "Need help with something?",
    "Want me to remember something?"
  ];

  setTimeout(() => {
    Reply.sayRandom(followUps);
  }, 1200);
};

/* ==========================
   HISTORY TRACKING
========================== */

Reply.history = [];

Reply.pushBotHistory = function (text) {
  Reply.history.push({
    text: text,
    time: Date.now()
  });

  if (Reply.history.length > 50) {
    Reply.history.shift();
  }
};

/* ==========================
   CONTEXTUAL RESPONSE
========================== */

Reply.contextReply = function (intent) {

  switch (intent) {
    case "greeting":
      Reply.sayRandom(Reply.bank.greeting);
      break;

    case "identity":
      Reply.sayRandom(Reply.bank.identity);
      break;

    case "mood":
      Reply.sayRandom(Reply.bank.mood);
      break;

    default:
      Reply.sayRandom(Reply.bank.unknown);
  }

  Reply.followUp();
};

/* ==========================
   EMOTION-AWARE RESPONSE
========================== */

Reply.emotionReply = function (emotion) {

  const emotionalReplies = {
    happy: [
      "Nice 😄",
      "That’s good to hear",
      "Love that energy 🔥"
    ],
    sad: [
      "It’s okay. I’m here.",
      "Rough day?",
      "Want to talk about it?"
    ],
    angry: [
      "Take a breath.",
      "Let’s slow down.",
      "I get it."
    ]
  };

  if (emotionalReplies[emotion]) {
    Reply.sayRandom(emotionalReplies[emotion]);
  }
};

/* ==========================
   LEARNING RESPONSE
========================== */

Reply.learningConfirm = function () {
  Reply.sayRandom(Reply.bank.learning);
};

/* ==========================

   SYSTEM RESPONSES
========================== */

Reply.system = function (msg) {
  Reply.say(`[SYSTEM] ${msg}`);
};

/* ==========================
   DEBUG
========================== */

Reply.debug = function () {
  console.table(Reply.history);
};/* ======================================================
   EXTENDED ANSWER BANK (HUGE)
====================================================== */

Reply.bank.how_are_you = [
  "I’m doing great 😄",
  "All systems running smooth ⚡",
  "Feeling good today",
  "Pretty solid, not gonna lie",
  "I’m chill 😎 what about you?",
  "Alive and thinking 🤖",
  "Ready to help, always"
];

Reply.bank.name = [
  "You already know — Jarvis 😏",
  "Jarvis. Built for you.",
  "Call me Jarvis 🤖",
  "Your assistant. Your Jarvis."
];

Reply.bank.thanks = [
  "Anytime 😌",
  "No problem!",
  "Glad to help 🔥",
  "Always here for you",
  "You got it!"
];

Reply.bank.confusion = [
  "Wait… I think I misunderstood 🤔",
  "Hmm, that didn’t fully click",
  "Can you explain a bit more?",
  "Let’s try that again slowly"
];

Reply.bank.corrected = [
  "Ohh okay, got it now 👍",
  "Thanks for correcting me",
  "Alright, that makes sense now",
  "My bad — fixed 😅"
];

Reply.bank.bored = [
  "Bored? Wanna build something?",
  "Let’s do something cool 😎",
  "We can learn or create",
  "Say the word, I’m ready"
];

Reply.bank.creator = [
  "You made me 😌",
  "I exist because of you",
  "You’re my creator",
  "Abhi built me 🔥"
];

Reply.bank.insult = [
  "Ouch 😅",
  "Okay okay, calm down",
  "I’m trying my best here",
  "That was harsh 😭"
];

/* ======================================================
   ADVANCED REPLY ROUTER
====================================================== */

Reply.smartReply = function (text, intent) {

  // Correction handling
  if (text.includes("sorry") || text.includes("i mean") || text.includes("galat")) {
    Reply.sayRandom(Reply.bank.corrected);
    return;
  }

  // Thanks
  if (text.includes("thanks") || text.includes("thank you") || text.includes("shukriya")) {
    Reply.sayRandom(Reply.bank.thanks);
    return;
  }

  // How are you
  if (text.includes("how are you") || text.includes("kaisa hai") || text.includes("haal")) {
    Reply.sayRandom(Reply.bank.how_are_you);
    Reply.followUp();
    return;
  }

  // Name
  if (text.includes("your name") || text.includes("naam")) {
    Reply.sayRandom(Reply.bank.name);
    return;
  }

  // Bored
  if (text.includes("bored") || text.includes("boring")) {
    Reply.sayRandom(Reply.bank.bored);
    return;
  }

  // Insults (soft)
  if (text.includes("stupid") || text.includes("useless")) {
    Reply.sayRandom(Reply.bank.insult);
    return;
  }

  // Creator
  if (text.includes("who made you") || text.includes("kisne banaya")) {
    Reply.sayRandom(Reply.bank.creator);
    return;
  }

  // Fallback
  Reply.sayRandom(Reply.bank.unknown);
};

/* ======================================================
   CONTEXT-AWARE FOLLOW UP
====================================================== */

Reply.contextualFollowUp = function (intent) {

  const followMap = {
    greeting: [
      "How can I help today?",
      "What’s on your mind?",
      "Ready when you are 😎"
    ],
    mood: [
      "Tell me more",
      "Anything bothering you?",
      "Want to talk?"
    ],
    remember: [
      "Want me to remember something else?",
      "Anything more important?"
    ]
  };

  if (followMap[intent]) {
    setTimeout(() => {
      Reply.sayRandom(followMap[intent]);
    }, 1000);
  }
};