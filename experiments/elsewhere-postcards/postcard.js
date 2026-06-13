import { createPostcard, normalizeSeed } from "./postcard-model.js?v=2";

(() => {
  "use strict";

  function render(seed) {
    const postcard = createPostcard(seed);
    const root = document.documentElement;
    const [skyA, skyB, landA, landB, sun, ink, paper] = postcard.palette;

    root.style.setProperty("--sky-a", skyA);
    root.style.setProperty("--sky-b", skyB);
    root.style.setProperty("--land-a", landA);
    root.style.setProperty("--land-b", landB);
    root.style.setProperty("--sun", sun);
    root.style.setProperty("--ink", ink);
    root.style.setProperty("--paper", paper);
    root.style.setProperty("--sun-x", postcard.sunX);
    root.style.setProperty("--sun-y", postcard.sunY);
    root.style.setProperty("--ridge-one", postcard.ridgeOne);
    root.style.setProperty("--ridge-two", postcard.ridgeTwo);
    root.style.setProperty("--scene-shift", postcard.sceneShift);
    root.style.setProperty("--drift", postcard.drift);

    document.querySelector("#landscape").className =
      `landscape scene-${postcard.scene}`;
    document.querySelector("#serial").textContent = postcard.serial;
    document.querySelector("#place").textContent = postcard.place;
    document.querySelector("#coordinates").textContent = postcard.coordinates;
    document.querySelector("#observation").textContent = postcard.observation;
    document.querySelector("#seed").value = postcard.seed;
    document.title = `${postcard.place} · Elsewhere Postcards`;
  }

  function seedFromHash() {
    const rawHash = window.location.hash.slice(1);
    try {
      return normalizeSeed(decodeURIComponent(rawHash));
    } catch {
      return "first-light";
    }
  }

  function setSeed(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (window.location.hash.slice(1) === normalizedSeed) {
      render(normalizedSeed);
      return;
    }
    window.location.hash = normalizedSeed;
  }

  document.querySelector("#seed-form").addEventListener("submit", (event) => {
    event.preventDefault();
    setSeed(document.querySelector("#seed").value);
  });

  document.querySelector("#another").addEventListener("click", () => {
    const values = new Uint32Array(2);
    crypto.getRandomValues(values);
    setSeed(`elsewhere-${values[0].toString(36)}-${values[1].toString(36)}`);
  });

  window.addEventListener("hashchange", () => render(seedFromHash()));

  if (!window.location.hash) {
    window.history.replaceState(null, "", "#first-light");
  }
  render(seedFromHash());
})();
