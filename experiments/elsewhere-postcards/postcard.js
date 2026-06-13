(() => {
  "use strict";

  const palettes = [
    ["#b9d4d1", "#edc9a8", "#4b655f", "#263f43", "#f6d47a", "#172326", "#efe7d2"],
    ["#b8c4d8", "#e9b6a3", "#705a6b", "#30374f", "#f0d892", "#222238", "#f0e6d5"],
    ["#d7caa1", "#b8ced0", "#647256", "#34483d", "#f1a66a", "#22312b", "#eee3c9"],
    ["#c8b6cf", "#e9d7bd", "#685d7a", "#323448", "#f4c96f", "#282333", "#f1e8d8"],
    ["#a9c9c1", "#d9b7a7", "#60756e", "#29454c", "#efd28a", "#183035", "#e9dfca"],
  ];

  const beginnings = [
    "Alder", "Brass", "Cinder", "Distant", "Echo", "Fallow", "Glass",
    "Hollow", "Ivory", "Juniper", "Kindred", "Lunar", "Morrow", "Nacre",
    "Ochre", "Pale", "Quiet", "Riven", "Salt", "Thistle",
  ];

  const endings = [
    "Bay", "Crossing", "Fold", "Harbor", "Interval", "March", "Reach",
    "Shelf", "Station", "Vale", "Weather", "Window",
  ];

  const subjects = [
    "The roofs collect a blue hour",
    "Three roads arrive without meeting",
    "The tide leaves its handwriting",
    "A bell rings below the salt",
    "The hills keep yesterday's light",
    "Every doorway faces a different season",
    "The last train is made of fog",
    "Shadows gather at the waterline",
    "The wind rehearses an old address",
    "Small lanterns drift above the fields",
  ];

  const endingsOfNotes = [
    "and nobody has named the distance.",
    "while the northern path remains warm.",
    "before the map remembers the coast.",
    "under a sky the color of unwritten letters.",
    "where evening begins twice.",
    "and the horizon answers in pale green.",
    "until the stones lose count.",
    "beside a river that returns by another name.",
  ];

  function hashSeed(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomFrom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function normalizeSeed(value) {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    return normalized || "first-light";
  }

  function createPostcard(seed) {
    const normalizedSeed = normalizeSeed(seed);
    const base = hashSeed(normalizedSeed);
    const random = randomFrom(base);
    const palette = pick(palettes, random);
    const place = `${pick(beginnings, random)} ${pick(endings, random)}`;
    const latitude = (92 + random() * 87).toFixed(2);
    const longitude = (185 + random() * 143).toFixed(2);
    const observation = `${pick(subjects, random)}, ${pick(endingsOfNotes, random)}`;

    return {
      seed: normalizedSeed,
      serial: `Elsewhere postal survey · ${String(base).padStart(10, "0")}`,
      place,
      coordinates: `${latitude}° beyond · ${longitude}° after`,
      observation,
      palette,
      sunX: `${18 + Math.floor(random() * 68)}%`,
      sunY: `${14 + Math.floor(random() * 31)}%`,
      ridgeOne: `${38 + Math.floor(random() * 16)}%`,
      ridgeTwo: `${51 + Math.floor(random() * 18)}%`,
    };
  }

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
