import {
  chooseObject,
  createExhibitLabel,
  createVisit,
  drawers,
  getCurrentDrawer,
  isComplete,
} from "./cabinet-model.js";

const introduction = document.querySelector("#introduction");
const game = document.querySelector("#game");
const progress = document.querySelector("#progress");
const drawerTitle = document.querySelector("#drawer-title");
const objects = document.querySelector("#objects");
const response = document.querySelector("#response");
const visitorResponse = document.querySelector("#visitor-response");
const cabinetResponse = document.querySelector("#cabinet-response");
const continueButton = document.querySelector("#continue-button");
const exhibit = document.querySelector("#exhibit");
const exhibitTitle = document.querySelector("#exhibit-title");
const exhibitIntro = document.querySelector("#exhibit-intro");
const labelList = document.querySelector("#label-list");
const beginButton = document.querySelector("#begin-button");
const restartButton = document.querySelector("#restart-button");

let visit = createVisit();

function renderDrawer() {
  const drawer = getCurrentDrawer(visit);

  progress.textContent = `Drawer ${visit.drawerIndex + 1} of ${drawers.length}`;
  drawerTitle.textContent = drawer.title;
  objects.replaceChildren();
  response.hidden = true;

  drawer.objects.forEach((object) => {
    const button = document.createElement("button");
    button.className = "object-button";
    button.type = "button";
    button.textContent = object.label;
    button.dataset.objectId = object.id;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => answerDrawer(button, object.id));
    objects.append(button);
  });

  objects.querySelector("button")?.focus();
}

function answerDrawer(selectedButton, objectId) {
  visit = chooseObject(visit, objectId);
  const entry = visit.entries.at(-1);

  objects.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.setAttribute(
      "aria-pressed",
      String(button === selectedButton),
    );
  });

  visitorResponse.textContent = `${entry.selected.label}: ${entry.selected.reason}`;
  cabinetResponse.textContent = `${entry.cabinetChoice.label}: ${entry.cabinetChoice.reason}`;
  continueButton.textContent = isComplete(visit)
    ? "Read the exhibit label"
    : "Open the next drawer";
  response.hidden = false;
  continueButton.focus();
}

function renderExhibit() {
  const label = createExhibitLabel(visit);

  game.hidden = true;
  exhibitTitle.textContent = label.title;
  exhibitIntro.textContent = label.introduction;
  labelList.replaceChildren();

  label.entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "label-entry";

    const drawer = document.createElement("dt");
    drawer.textContent = entry.drawer;

    const visitor = document.createElement("dd");
    const visitorLabel = document.createElement("span");
    visitorLabel.textContent = "Visitor set aside";
    visitor.append(visitorLabel, entry.visitorChoice);

    const cabinet = document.createElement("dd");
    const cabinetLabel = document.createElement("span");
    cabinetLabel.textContent = "Cabinet set aside";
    cabinet.append(cabinetLabel, entry.cabinetChoice);

    row.append(drawer, visitor, cabinet);
    labelList.append(row);
  });

  exhibit.hidden = false;
  exhibitTitle.focus?.();
  restartButton.focus();
}

function beginVisit() {
  introduction.hidden = true;
  exhibit.hidden = true;
  game.hidden = false;
  renderDrawer();
}

function restartVisit() {
  visit = createVisit();
  exhibit.hidden = true;
  game.hidden = true;
  introduction.hidden = false;
  beginButton.focus();
}

beginButton.addEventListener("click", beginVisit);
continueButton.addEventListener("click", () => {
  if (isComplete(visit)) {
    renderExhibit();
    return;
  }

  renderDrawer();
});
restartButton.addEventListener("click", restartVisit);
