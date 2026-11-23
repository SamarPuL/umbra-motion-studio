const films = [
  {
    id: "penumbra", title: "Penumbra", genre: "Science fiction",
    line: "A lone traveler crosses a world caught in a permanent eclipse.",
    notes: "The horizon holds still while everything in the foreground moves. A wide view of the ash plain gives way to a scratched visor, where the black sun appears for a second time. A low, beating drone carries the cut back into the landscape.",
    shots: ["Eclipse plain", "The visor"],
    descriptions: ["An orange solar corona over a traveler on a basalt ridge", "The eclipse reflected in a dust-scoured expedition visor"]
  },
  {
    id: "dead-air", title: "Dead Air", genre: "Analog sci-fi",
    line: "An abandoned listening station receives one last transmission.",
    notes: "Saltwater has reached almost every surface of the offshore array. Outside, waves work against the pilings. Inside, a receiver is still listening. The short signal in the sound mix keeps time between the two spaces.",
    shots: ["Listening station", "Receiver bank"],
    descriptions: ["An offshore radar dish above a cold, rolling sea", "A dim oscilloscope and worn analog radio controls"]
  },
  {
    id: "understory", title: "Understory", genre: "Dark fantasy",
    line: "Deep in the forest, a stone doorway remembers the way home.",
    notes: "A figure stops at a stone threshold. The next frame moves down to the forest floor, where lichen grows across a cut in the rock. Flecks of light and a high, wavering tone connect the two scales.",
    shots: ["Stone threshold", "Lichen stone"],
    descriptions: ["A traveler beneath a moss-covered stone arch in a green ravine", "An ancient carved stone among wet moss and roots"]
  }
];
const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const number = n => String(n + 1).padStart(2, "0");
const still = (film, detail = false, small = false) => `assets/stills/${film.id}${detail ? "-detail" : ""}${small ? "-sm" : ""}.webp`;
const videoUrl = id => `assets/films/${id}.mp4`;
const icon = name => `<svg class="icon ${name === "play" ? "fill" : ""}" aria-hidden="true"><use href="#${name}"/></svg>`;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let featured = 0;
let scrubVideo;
let scrubTarget = 0;
const art = one(".hero-art");
const hero = one(".hero");

function releaseScrub() {
  if (!scrubVideo) return;
  const previous = scrubVideo;
  scrubVideo = null;
  previous.remove();
  previous.removeAttribute("src");
  previous.load();
}
function setFeature(index) {
  if (index === featured) return;
  featured = index;
  releaseScrub();
  const film = films[index];
  const img = new Image();
  img.id = "feature-art";
  img.alt = "";
  img.src = still(film);
  art.replaceChildren(img);
  one("#feature-title").textContent = film.title.toUpperCase();
  one("#feature-line").textContent = film.line;
  one("#feature-number").textContent = "0" + number(index);
  one("#counter").textContent = number(index);
  all(".mini").forEach((button, i) => button.setAttribute("aria-pressed", i === index));
  syncScroll();
}
one("#mini-strip").innerHTML = films.map((film, i) =>
  `<button class="mini" type="button" aria-label="Feature ${film.title}" aria-pressed="${i === 0}"><img src="${still(film, false, true)}" alt=""></button>`
).join("");
all(".mini").forEach((button, i) => button.addEventListener("click", () => setFeature(i)));
one("#mini-strip").addEventListener("keydown", e => {
  if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault();
  setFeature((featured + (e.key === "ArrowRight" ? 1 : -1) + films.length) % films.length);
  all(".mini")[featured].focus();
});
one("#film-grid").innerHTML = films.map((film, i) =>
  `<button class="film-card" type="button" data-play="${film.id}" aria-label="Watch ${film.title}">
    <div class="card-image"><img loading="lazy" src="${still(film,true,true)}" srcset="${still(film,true,true)} 600w, ${still(film,true)} 1920w" sizes="(max-width:620px) 92vw, 31vw" alt="${film.descriptions[1]}"><span class="card-number mono">UM—0${number(i)}</span><span class="card-time mono">00:12</span></div>
    <div class="card-text"><div><span class="film-title">${film.title}</span><span class="card-genre mono">${film.genre}</span></div><span class="card-arrow">${icon("up-right")}</span></div>
  </button>`
).join("");

const viewer = one("#viewer");
const viewerContent = one("#viewer-content");
function clearViewer() {
  const video = one("video", viewer);
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  viewerContent.replaceChildren();
}
function openViewer(id, showNotes = false) {
  stopCut();
  const film = films.find(item => item.id === id);
  const isReel = id === "reel";
  if (!isReel && !film) return;
  clearViewer();
  if (showNotes) {
    viewerContent.innerHTML = `<img class="notes-art" src="${still(film,true)}" alt="${film.descriptions[1]}">
      <div class="notes-body"><div class="mono">Film notes &nbsp;/&nbsp; ${film.genre}</div><h2 id="viewer-title" class="dialog-title">${film.title}</h2><p>${film.notes}</p><button class="btn btn-hot" type="button" data-play="${id}">${icon("play")}Watch study</button></div>`;
  } else {
    const title = isReel ? "Studio reel" : film.title;
    viewerContent.innerHTML = `<video controls playsinline preload="metadata" poster="${still(film || films[0])}" aria-label="${title}, a motion study with an ambient soundtrack" src="${videoUrl(isReel ? "studio-reel" : id)}"></video>
      <div class="viewer-foot"><h2 id="viewer-title" class="dialog-title">${title}</h2><span class="mono">${isReel ? "Studio collection / Vol. 01" : film.genre} &nbsp;·&nbsp; ${isReel ? "00:21" : "00:12"}</span></div>`;
  }
  if (!viewer.open) viewer.showModal();
  one("#close-viewer").focus({preventScroll:true});
  one("video", viewer)?.play().catch(() => {});
}
document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-play]");
  if (trigger) openViewer(trigger.dataset.play);
});
one("#play-feature").addEventListener("click", () => openViewer(films[featured].id));
one("#feature-notes").addEventListener("click", () => openViewer(films[featured].id, true));
one("#close-viewer").addEventListener("click", () => viewer.close());
viewer.addEventListener("close", () => {
  // A queued close can arrive after the next screening has already opened.
  if (!viewer.open) clearViewer();
});
viewer.addEventListener("click", event => {
  if (event.target !== viewer) return;
  const r = viewer.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) viewer.close();
});

const frames = films.flatMap(film => film.shots.map((name, j) => ({
  title: name, description: film.descriptions[j], image: still(film, !!j), thumb: still(film, !!j, true)
})));
const edit = [0, 3, 4];
const monitor = one("#monitor-img");
const canvas = one("#develop");
const grades = {
  print: "saturate(1) contrast(1)",
  silver: "grayscale(1) contrast(1.16)",
  bleach: "saturate(.38) contrast(1.28) sepia(.18)"
};
let selectedShot = 0;
let grade = "print";
let timer = null;
let developId = 0;
let drawFrame = 0;
let playing = false;

one("#shots").innerHTML = edit.map((frameId, slot) =>
  `<div class="shot"><button class="shot-preview" type="button" aria-label="Preview shot ${slot+1}"><img class="shot-img" src="${frames[frameId].thumb}" alt=""></button>
  <label for="shot-${slot}">SHOT ${number(slot)}</label><select id="shot-${slot}">${frames.map((frame, j) => `<option value="${j}" ${j===frameId?"selected":""}>${frame.title}</option>`).join("")}</select></div>`
).join("");
const shotControls = all(".shot");
function renderShot(slot, develop = false) {
  selectedShot = slot;
  const frame = frames[edit[slot]];
  const token = ++developId;
  cancelAnimationFrame(drawFrame);
  canvas.hidden = true;
  monitor.alt = frame.description;
  monitor.src = frame.image;
  one("#monitor-code").textContent = "Shot " + number(slot) + " / 03";
  shotControls.forEach((row,i) => {
    row.classList.toggle("active", slot === i);
    one("button", row).setAttribute("aria-pressed", slot === i);
  });
  if (!develop || reduced.matches) return;
  monitor.decode().then(() => {
    if (token !== developId) return;
    const ctx = canvas.getContext("2d");
    const start = performance.now();
    canvas.hidden = false;
    function reveal(now) {
      if (token !== developId) return;
      const progress = (now - start)/680;
      if (progress >= 1) {canvas.hidden = true; return;}
      canvas.width = Math.max(12, Math.round(12 * Math.pow(62,progress)));
      canvas.height = Math.max(5, Math.round(canvas.width / 2.35));
      ctx.drawImage(monitor,0,0,canvas.width,canvas.height);
      drawFrame = requestAnimationFrame(reveal);
    }
    drawFrame = requestAnimationFrame(reveal);
  }).catch(() => {});
}
function changeShot(slot, newFrame) {
  stopCut();
  edit[slot] = newFrame;
  one("select", shotControls[slot]).value = newFrame;
  one("img", shotControls[slot]).src = frames[newFrame].thumb;
  renderShot(slot,true);
  one("#sequence-status").textContent = "Shot " + number(slot) + " updated";
}
shotControls.forEach((row,slot) => {
  one("select",row).addEventListener("change", event => changeShot(slot,Number(event.target.value)));
  one("button",row).addEventListener("click", () => {stopCut();renderShot(slot);});
});
function applyGrade() {
  const ev = Number(one("#exposure").value)/10;
  const label = (ev>0 ? "+" : "") + ev.toFixed(1) + " EV";
  one("#exposure-value").value = label;
  one("#exposure").setAttribute("aria-valuetext",label);
  one(".monitor-image").style.filter = grades[grade] + " brightness(" + Math.pow(2,ev) + ")";
}
all("[data-grade]").forEach(button => button.addEventListener("click", () => {
  grade = button.dataset.grade;
  all("[data-grade]").forEach(b => b.setAttribute("aria-pressed",b === button));
  applyGrade();
}));
one("#exposure").addEventListener("input",applyGrade);
one("#new-frame").addEventListener("click",() => {
  const different = frames.map((_,i) => i).filter(i => !edit.includes(i));
  changeShot(selectedShot, different[Math.floor(Math.random()*different.length)]);
});
function stopCut(status = "Edit ready") {
  clearTimeout(timer);
  timer = null;
  playing = false;
  one("#play-cut span").textContent = "Play cut";
  one("#sequence-status").textContent = status;
}
one("#play-cut").addEventListener("click", () => {
  if (playing) {stopCut("Cut stopped");return;}
  playing = true;
  one("#play-cut span").textContent = "Stop cut";
  function advance(slot) {
    renderShot(slot);
    one("#sequence-status").textContent = "Playing shot " + number(slot);
    timer = setTimeout(() => slot < 2 ? advance(slot+1) : stopCut("Cut complete"),2000);
  }
  advance(0);
});
document.addEventListener("visibilitychange", () => {if(document.hidden && playing) stopCut("Cut paused");});
renderShot(0);

function seekScrub() {
  if (scrubVideo && scrubVideo.readyState >= 2 && !scrubVideo.seeking && Math.abs(scrubVideo.currentTime-scrubTarget) > .045) {
    scrubVideo.currentTime = scrubTarget;
  }
}
function prepareScrub() {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.className = "scrub-film";
  video.setAttribute("aria-hidden","true");
  video.tabIndex = -1;
  video.addEventListener("loadeddata",seekScrub);
  video.addEventListener("seeked",() => {
    if (scrubVideo !== video) return;
    video.classList.toggle("visible",scrubTarget > .06);
    seekScrub();
  });
  video.src = videoUrl(films[featured].id);
  scrubVideo = video;
  art.append(video);
}
const links = all("nav a");
const sections = links.map(link => one(link.hash));
let pendingScroll = 0;
function syncScroll() {
  pendingScroll = 0;
  const rect = hero.getBoundingClientRect();
  const fraction = Math.max(0,Math.min(1,-rect.top / rect.height));
  const active = sections.filter(section => section.getBoundingClientRect().top <= innerHeight*.45).at(-1) || hero;
  links.forEach((link,i) => {
    if(sections[i] === active) link.setAttribute("aria-current","location");
    else link.removeAttribute("aria-current");
  });
  if (reduced.matches || navigator.connection?.saveData) {releaseScrub();return;}
  if (rect.bottom < 0) return;
  art.style.setProperty("--zoom",String(1+fraction*.055));
  scrubTarget = fraction*4.7;
  if (fraction > .015 && !scrubVideo) prepareScrub();
  if (scrubTarget <= .06) scrubVideo?.classList.remove("visible");
  seekScrub();
}
function scheduleScroll() {
  if (!pendingScroll) pendingScroll = requestAnimationFrame(syncScroll);
}
window.addEventListener("scroll",scheduleScroll,{passive:true});
window.addEventListener("resize",scheduleScroll);
reduced.addEventListener("change",syncScroll);
syncScroll();
