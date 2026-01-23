/* ======================================================
   JARVIS MEMORY ENGINE
   File: core/memory.js
   Role: Long-term memory + learning
====================================================== */

const Memory = {};

/* ==========================
   STORAGE KEYS
========================== */

Memory.keys = {
  notes: "jarvis_memory_notes",
  unknown: "jarvis_unknown_inputs",
  profile: "jarvis_profile_data"
};

/* ==========================
   INTERNAL STATE
========================== */

Memory.state = {
  notes: [],
  unknowns: [],
  profile: {}
};

/* ==========================
   INIT
========================== */

Memory.init = function () {
  Memory.loadAll();
};

/* ==========================
   LOADERS
========================== */

Memory.loadAll = function () {
  Memory.state.notes = Memory.load(Memory.keys.notes) || [];
  Memory.state.unknowns = Memory.load(Memory.keys.unknown) || [];
  Memory.state.profile = Memory.load(Memory.keys.profile) || {};
};

Memory.load = function (key) {
  try {
    let raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Memory load failed:", key);
    return null;
  }
};

/* ==========================
   SAVERS
========================== */

Memory.save = function (key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};

/* ==========================
   NOTE MEMORY
========================== */

Memory.saveNote = function (text) {
  let entry = {
    text: text,
    time: Date.now()
  };

  Memory.state.notes.push(entry);
  Memory.save(Memory.keys.notes, Memory.state.notes);
};

Memory.lastNote = function () {
  if (Memory.state.notes.length === 0) return null;
  return Memory.state.notes[Memory.state.notes.length - 1].text;
};

Memory.allNotes = function () {
  return Memory.state.notes.map(n => n.text);
};

/* ==========================
   UNKNOWN LEARNING
========================== */

Memory.saveUnknown = function (text) {
  Memory.state.unknowns.push({
    text: text,
    time: Date.now()
  });

  Memory.save(Memory.keys.unknown, Memory.state.unknowns);
};

Memory.getUnknowns = function () {
  return Memory.state.unknowns;
};

/* ==========================
   FORGETTING
========================== */

Memory.forgetLast = function () {
  if (Memory.state.notes.length === 0) return false;
  Memory.state.notes.pop();
  Memory.save(Memory.keys.notes, Memory.state.notes);
  return true;
};

Memory.clearAll = function () {
  Memory.state.notes = [];
  Memory.state.unknowns = [];
  Memory.save(Memory.keys.notes, []);
  Memory.save(Memory.keys.unknown, []);
};

/* ==========================
   PROFILE MEMORY
========================== */

Memory.setProfile = function (key, value) {
  Memory.state.profile[key] = value;
  Memory.save(Memory.keys.profile, Memory.state.profile);
};

Memory.getProfile = function (key) {
  return Memory.state.profile[key] || null;
};

/* ==========================
   SMART RECALL
========================== */

Memory.search = function (keyword) {
  return Memory.state.notes.filter(n =>
    n.text.toLowerCase().includes(keyword.toLowerCase())
  );
};

/* ==========================
   EXPORT FOR DEBUG
========================== */

Memory.debug = function () {
  console.log("🧠 NOTES:", Memory.state.notes);
  console.log("❓ UNKNOWN:", Memory.state.unknowns);
  console.log("👤 PROFILE:", Memory.state.profile);
};