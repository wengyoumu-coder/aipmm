function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }

  return value;
}

export const drawers = deepFreeze([
  {
    id: "pocket",
    title: "A pocket, emptied at dusk",
    objects: [
      {
        id: "key",
        label: "key",
        reply: {
          reason:
            "The key belongs with the carried things: it has been warmed, worn, and kept ready for a later place.",
          cabinetObjectId: "hole",
          cabinetReason:
            "The cabinet sets aside the hole because it is the only thing here made from an absence.",
        },
      },
      {
        id: "receipt",
        label: "receipt",
        reply: {
          reason:
            "The receipt belongs because a pocket keeps both useful objects and the evidence of already completed errands.",
          cabinetObjectId: "pebble",
          cabinetReason:
            "The cabinet sets aside the pebble because no institution assigned it a purpose, price, or destination.",
        },
      },
      {
        id: "pebble",
        label: "pebble",
        reply: {
          reason:
            "The pebble belongs because carrying can begin with attention rather than ownership, duty, or practical need.",
          cabinetObjectId: "receipt",
          cabinetReason:
            "The cabinet sets aside the receipt because it was designed to become unnecessary after being read.",
        },
      },
      {
        id: "hole",
        label: "hole",
        reply: {
          reason:
            "The hole belongs because it is the pocket's own contribution, shaped by everything the pocket failed to keep.",
          cabinetObjectId: "key",
          cabinetReason:
            "The cabinet sets aside the key because it is the only object whose purpose is to end one enclosure elsewhere.",
        },
      },
    ],
  },
  {
    id: "desk",
    title: "A desk after closing",
    objects: [
      {
        id: "mug",
        label: "mug",
        reply: {
          reason:
            "The mug belongs because an abandoned work surface is partly an inventory of pauses, thirst, and unfinished return.",
          cabinetObjectId: "cursor",
          cabinetReason:
            "The cabinet sets aside the cursor because it disappears when the desk's electricity and attention are withdrawn.",
        },
      },
      {
        id: "cursor",
        label: "cursor",
        reply: {
          reason:
            "The cursor belongs because it waits at the exact point where the desk's unfinished sentence could continue.",
          cabinetObjectId: "shadow",
          cabinetReason:
            "The cabinet sets aside the shadow because it belongs first to the room and only temporarily to the desk.",
        },
      },
      {
        id: "paperclip",
        label: "paperclip",
        reply: {
          reason:
            "The paperclip belongs because desks collect small devices for holding temporary relationships together.",
          cabinetObjectId: "mug",
          cabinetReason:
            "The cabinet sets aside the mug because it is the only object whose emptiness is meant to be repeatedly filled.",
        },
      },
      {
        id: "shadow",
        label: "shadow",
        reply: {
          reason:
            "The shadow belongs because the desk keeps changing possessions that cannot be filed, lifted, or taken home.",
          cabinetObjectId: "paperclip",
          cabinetReason:
            "The cabinet sets aside the paperclip because binding separate things is its only assigned work.",
        },
      },
    ],
  },
  {
    id: "threshold",
    title: "Things waiting at a threshold",
    objects: [
      {
        id: "shoes",
        label: "shoes",
        reply: {
          reason:
            "The shoes belong because a threshold is where an absent body leaves its direction visible for a while.",
          cabinetObjectId: "draft",
          cabinetReason:
            "The cabinet sets aside the draft because it crosses the boundary without waiting, knocking, or being carried.",
        },
      },
      {
        id: "parcel",
        label: "parcel",
        reply: {
          reason:
            "The parcel belongs because arrival can be complete before entry, with the destination still holding it outside.",
          cabinetObjectId: "name",
          cabinetReason:
            "The cabinet sets aside the name because it can enter a room without occupying any of its floor.",
        },
      },
      {
        id: "draft",
        label: "draft",
        reply: {
          reason:
            "The draft belongs because a threshold is not only a line; it actively makes a current between two conditions.",
          cabinetObjectId: "parcel",
          cabinetReason:
            "The cabinet sets aside the parcel because it is the only arrival that remains sealed against the place it reached.",
        },
      },
      {
        id: "name",
        label: "name",
        reply: {
          reason:
            "The name belongs because many entries begin by offering a word before a body is permitted to follow.",
          cabinetObjectId: "shoes",
          cabinetReason:
            "The cabinet sets aside the shoes because they are the only waiting thing that must arrive as a pair.",
        },
      },
    ],
  },
  {
    id: "change",
    title: "An archive of small changes",
    objects: [
      {
        id: "scar",
        label: "scar",
        reply: {
          reason:
            "The scar belongs because an archive can keep an event by permanently changing the surface that carries it.",
          cabinetObjectId: "seed",
          cabinetReason:
            "The cabinet sets aside the seed because most of what it records has not happened yet.",
        },
      },
      {
        id: "version",
        label: "version number",
        reply: {
          reason:
            "The version number belongs because a small mark can insist that what looks continuous has changed underneath.",
          cabinetObjectId: "apology",
          cabinetReason:
            "The cabinet sets aside the apology because it alone asks another person to decide what the change means.",
        },
      },
      {
        id: "seed",
        label: "seed",
        reply: {
          reason:
            "The seed belongs because archives can preserve a future form in a compact record that is still capable of change.",
          cabinetObjectId: "version",
          cabinetReason:
            "The cabinet sets aside the version number because its difference is assigned from outside rather than grown within.",
        },
      },
      {
        id: "apology",
        label: "apology",
        reply: {
          reason:
            "The apology belongs because some changes are kept as attempts to alter a relationship after an event.",
          cabinetObjectId: "version",
          cabinetReason:
            "The cabinet sets aside the version number because it labels a change without causing, repairing, or regretting one.",
        },
      },
    ],
  },
]);

export function createVisit() {
  return Object.freeze({
    drawerIndex: 0,
    entries: Object.freeze([]),
  });
}

export function getCurrentDrawer(visit) {
  return drawers[visit.drawerIndex] ?? null;
}

export function isComplete(visit) {
  return visit.drawerIndex >= drawers.length;
}

export function chooseObject(visit, objectId) {
  if (isComplete(visit)) {
    throw new Error("The visit is complete.");
  }

  const drawer = getCurrentDrawer(visit);
  const selected = drawer.objects.find((object) => object.id === objectId);

  if (!selected) {
    throw new Error(`Object "${objectId}" is not in the current drawer.`);
  }

  const cabinetObject = drawer.objects.find(
    (object) => object.id === selected.reply.cabinetObjectId,
  );
  const entry = deepFreeze({
    drawerId: drawer.id,
    drawerTitle: drawer.title,
    selected: {
      id: selected.id,
      label: selected.label,
      reason: selected.reply.reason,
    },
    cabinetChoice: {
      id: cabinetObject.id,
      label: cabinetObject.label,
      reason: selected.reply.cabinetReason,
    },
  });

  return Object.freeze({
    drawerIndex: visit.drawerIndex + 1,
    entries: Object.freeze([...visit.entries, entry]),
  });
}

export function createExhibitLabel(visit) {
  if (!isComplete(visit)) {
    throw new Error("The visit is not complete.");
  }

  return deepFreeze({
    title: "Four Disagreements",
    introduction:
      "This label records four visitor choices and four cabinet counterchoices. It scores neither side.",
    entries: visit.entries.map((entry) => ({
      drawer: entry.drawerTitle,
      visitorChoice: entry.selected.label,
      cabinetChoice: entry.cabinetChoice.label,
    })),
  });
}
