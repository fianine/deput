/**
 * Parallax requirements:
 * - scene element
 * - direct child layers with data-depth
 * - init new Parallax(scene, options)
 * (lihat docs wagerfield/parallax)  :contentReference[oaicite:3]{index=3}
 */

const CONFIG = {
  couple: "Aulia & Reza",
  dateISO: "2026-05-08T14:00:00+07:00", // tanggal akad (WIB)
  locationText: "Surabaya",
  // Link "Simpan Tanggal" (Google Calendar event template)
  calendar: {
    title: "Wedding Aulia & Reza",
    details: "Undangan Pernikahan",
    location: "Surabaya",
    start: "20260508T070000Z",
    end: "20260508T080000Z"
  }
};

// ---------- Helpers ----------
function $(id){ return document.getElementById(id); }
function pad(n){ return String(n).padStart(2, "0"); }

function getGuestName(){
  const url = new URL(window.location.href);
  const guest = url.searchParams.get("nama");
  if (!guest) return "Tamu Undangan";
  // decode + rapikan
  return decodeURIComponent(guest.replace(/\+/g, " ")).trim() || "Tamu Undangan";
}

function buildGoogleCalLink(){
  const c = CONFIG.calendar;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: c.title,
    details: c.details,
    location: c.location,
    dates: `${c.start}/${c.end}`,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

// ---------- Cover guest name ----------
$("guestName").textContent = getGuestName();

// ---------- Lock until open ----------
document.body.classList.add("lock");
const coverEl = $("cover");
const mainEl = $("main");
const bgm = $("bgm");
const musicBtn = $("musicBtn");

let musicOn = false;

async function toggleMusic(forceOn = null){
  const next = forceOn === null ? !musicOn : !!forceOn;
  try{
    if(next){
      await bgm.play();
      musicOn = true;
      musicBtn.textContent = "❚❚";
      musicBtn.setAttribute("aria-label","Jeda musik");
    }else{
      bgm.pause();
      musicOn = false;
      musicBtn.textContent = "♫";
      musicBtn.setAttribute("aria-label","Putar musik");
    }
  }catch{
    // Autoplay restrictions: user harus interaksi.
  }
}

musicBtn.addEventListener("click", () => toggleMusic());

// Open invite
$("openInvite").addEventListener("click", async () => {
  coverEl.classList.add("hidden");
  document.body.classList.remove("lock");
  // auto play after user interaction
  await toggleMusic(true);
  // smooth scroll to top hero
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- Parallax init ----------
function initParallax(){
  const coverScene = $("coverScene");
  const heroScene = $("heroScene");

  // Desktop feel: hoverOnly + relativeInput
  // Mobile: gyro will work if available, otherwise cursor fallback
  const opts = {
    relativeInput: true,
    hoverOnly: true,
    frictionX: 0.08,
    frictionY: 0.08,
    scalarX: 10,
    scalarY: 10,
  };

  if (coverScene) new Parallax(coverScene, opts);
  if (heroScene) new Parallax(heroScene, opts);
}
initParallax();

// ---------- Countdown ----------
const target = new Date(CONFIG.dateISO).getTime();
const elD = $("d"), elH = $("h"), elM = $("m"), elS = $("s");

function tick(){
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const days  = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins  = Math.floor((diff / (1000*60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  elD.textContent = days;
  elH.textContent = pad(hours);
  elM.textContent = pad(mins);
  elS.textContent = pad(secs);
}
tick();
setInterval(tick, 1000);

// "Simpan Tanggal"
$("saveDateBtn").href = buildGoogleCalLink();

// ---------- Gallery lightbox ----------
const lightbox = $("lightbox");
const lbImg = $("lbImg");
const lbClose = $("lbClose");
const gallery = $("gallery");

function openLightbox(src){
  if(!src) return;
  lbImg.src = src;
  lightbox.classList.add("show");
  lightbox.setAttribute("aria-hidden","false");
}
function closeLightbox(){
  lbImg.removeAttribute("src");
  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden","true");
}
lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if(e.target === lightbox) closeLightbox(); });

gallery.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-src]");
  if(!btn) return;
  openLightbox(btn.getAttribute("data-src"));
});
