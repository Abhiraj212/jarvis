/* ===============================
   JARVIS AI – BIG JS CORE
   =============================== */

const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const cam = document.getElementById("cam");

/* ---------- MEMORY SYSTEM ---------- */
let memory = JSON.parse(localStorage.getItem("jarvisMemory")) || {
  owner: "Abhiraj",
  mood: "normal",
  likes: [],
  dislikes: [],
  notes: [],
  facts: {},
  face: null,
  chats: []
};

function saveMemory(){
  localStorage.setItem("jarvisMemory", JSON.stringify(memory));
}

/* ---------- UI HELPERS ---------- */
function add(text, cls){
  let d = document.createElement("div");
  d.className = cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function speak(text){
  let u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  speechSynthesis.speak(u);
}

/* ---------- MAIN BRAIN ---------- */
function brain(text){
  text = text.toLowerCase().trim();

  if(!text.includes("jarvis")) return null;
  text = text.replace("jarvis","").trim();

  /* BASIC */
  if(text === "") return "Yes boss 😎";
  if(text.includes("your name")) return "My name is Jarvis.";
  if(text.includes("who made you")) return "You made me boss 🔥";
  if(text.includes("who am i")) return `You are ${memory.owner}.`;

  /* TIME + DATE */
  if(text.includes("time")) return new Date().toLocaleTimeString();
  if(text.includes("date")) return new Date().toDateString();

  /* MOOD */
  if(text.includes("how are you")){
    if(memory.mood==="happy") return "Feeling great 😄";
    if(memory.mood==="sad") return "Little sad 🥲";
    return "I am normal 🙂";
  }

  if(text.includes("be happy")){
    memory.mood="happy"; saveMemory();
    return "Mood updated 😄";
  }

  if(text.includes("be sad")){
    memory.mood="sad"; saveMemory();
    return "Okay 🥲";
  }

  /* REMEMBER NOTES */
  if(text.startsWith("remember")){
    let note = text.replace("remember","").trim();
    memory.notes.push(note);
    saveMemory();
    return "Saved in memory 🧠";
  }

  if(text.includes("what did i say")){
    return memory.notes.length
      ? memory.notes[memory.notes.length-1]
      : "Nothing remembered yet.";
  }

  /* LIKES / DISLIKES */
  if(text.startsWith("i like")){
    let l = text.replace("i like","").trim();
    memory.likes.push(l);
    saveMemory();
    return `Okay, you like ${l}`;
  }

  if(text.startsWith("i hate")){
    let d = text.replace("i hate","").trim();
    memory.dislikes.push(d);
    saveMemory();
    return `Got it, you hate ${d}`;
  }

  if(text.includes("what do i like")){
    return memory.likes.length
      ? "You like: " + memory.likes.join(", ")
      : "You never told me.";
  }

  if(text.includes("what do i hate")){
    return memory.dislikes.length
      ? "You hate: " + memory.dislikes.join(", ")
      : "You never told me.";
  }

  /* FACT SYSTEM */
  if(text.startsWith("my")){
    let parts = text.split("is");
    if(parts.length===2){
      let key = parts[0].replace("my","").trim();
      let val = parts[1].trim();
      memory.facts[key] = val;
      saveMemory();
      return `Okay, your ${key} is ${val}`;
    }
  }

  if(text.startsWith("what is my")){
    let key = text.replace("what is my","").trim();
    return memory.facts[key]
      ? `Your ${key} is ${memory.facts[key]}`
      : "I don't know that yet.";
  }

  /* CHAT MEMORY */
  if(text.includes("what we talked")){
    return memory.chats.slice(-5).join(" | ") || "No chat history.";
  }

  /* COMMANDS */
  if(text.includes("clear memory")){
    localStorage.clear();
    return "All memory wiped 🧹";
  }

  if(text.includes("sleep")){
    return "Going silent 😴";
  }

  /* DEFAULT SMART REPLY */
  return randomReply();
}

/* ---------- RANDOM CHAT ---------- */
function randomReply(){
  let arr = [
    "Say clearly boss 🙂",
    "Hmm interesting 🤔",
    "I am listening 👂",
    "Try another command 😎",
    "Explain more boss 🔥"
  ];
  return arr[Math.floor(Math.random()*arr.length)];
}

/* ---------- SEND ---------- */
function send(){
  let t = input.value.trim();
  if(!t) return;
  input.value = "";

  add("You: "+t, "user");
  memory.chats.push(t);
  saveMemory();

  let ans = brain(t);
  if(ans){
    add("Jarvis: "+ans, "bot");
    speak(ans);
  }
}

/* ---------- VOICE INPUT ---------- */
function startListening(){
  let r = new webkitSpeechRecognition();
  r.lang = "en-IN";
  r.continuous = true;

  r.onresult = e=>{
    let t = e.results[e.results.length-1][0].transcript;
    add("You: "+t,"user");
    memory.chats.push(t);

    let ans = brain(t);
    if(ans){
      add("Jarvis: "+ans,"bot");
      speak(ans);
    }
    saveMemory();
  };

  r.start();
  add("Jarvis: Listening 🎧","bot");
}

/* ---------- CAMERA + FACE ---------- */
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function openCamera(){
  navigator.mediaDevices.getUserMedia({video:true})
  .then(stream=>{
    cam.style.display="block";
    cam.srcObject=stream;
    setTimeout(captureFace, 3000);
  });
}

function captureFace(){
  canvas.width = cam.videoWidth;
  canvas.height = cam.videoHeight;
  ctx.drawImage(cam,0,0);
  let img = canvas.toDataURL();

  if(!memory.face){
    memory.face = img;
    saveMemory();
    add("Jarvis: Face saved 😎","bot");
    speak("Yo boss");
  }else{
    if(img.slice(0,1000) === memory.face.slice(0,1000)){
      add("Jarvis: Welcome back boss 😎","bot");
      speak("Welcome back boss");
    }else{
      add("Jarvis: Who are you?","bot");
      speak("Who are you");
    }
  }
}

/* ---------- EXTRA ---------- */
function showMemory(){
  add("Likes: "+memory.likes.join(", "),"bot");
  add("Notes: "+memory.notes.join(" | "),"bot");
}

function clearChat(){
  chat.innerHTML="";
}

/* ---------- START ---------- */
add("Jarvis: Online. Say 'Jarvis' 🔥","bot");