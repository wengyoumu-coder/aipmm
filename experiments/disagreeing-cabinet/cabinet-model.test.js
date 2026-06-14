import assert from "node:assert/strict";
import { test } from "vitest";

import {
  chooseObject,
  createExhibitLabel,
  createVisit,
  drawers,
  getCurrentDrawer,
  isComplete,
} from "./cabinet-model.js";

function visitAt(drawerIndex) {
  let visit = createVisit();

  for (let index = 0; index < drawerIndex; index += 1) {
    visit = chooseObject(visit, drawers[index].objects[0].id);
  }

  return visit;
}

test("a new visit opens the first four-object drawer", () => {
  const visit = createVisit();
  const drawer = getCurrentDrawer(visit);

  assert.equal(visit.drawerIndex, 0);
  assert.deepEqual(visit.entries, []);
  assert.equal(drawer.id, drawers[0].id);
  assert.equal(drawer.objects.length, 4);
});

test("every authored choice returns a complete counterclassification", () => {
  drawers.forEach((drawer, drawerIndex) => {
    drawer.objects.forEach((object) => {
      const visit = visitAt(drawerIndex);
      const nextVisit = chooseObject(visit, object.id);
      const entry = nextVisit.entries.at(-1);

      assert.equal(entry.drawerId, drawer.id);
      assert.equal(entry.selected.id, object.id);
      assert.ok(entry.selected.reason.length >= 20);
      assert.notEqual(entry.cabinetChoice.id, object.id);
      assert.ok(
        drawer.objects.some(
          (candidate) => candidate.id === entry.cabinetChoice.id,
        ),
      );
      assert.ok(entry.cabinetChoice.reason.length >= 20);
      assert.equal(nextVisit.drawerIndex, drawerIndex + 1);
      assert.deepEqual(visit.entries.length, drawerIndex);
    });
  });
});

test("unknown objects and choices after completion are rejected", () => {
  assert.throws(
    () => chooseObject(createVisit(), "missing-object"),
    /not in the current drawer/,
  );

  let visit = createVisit();
  drawers.forEach((drawer) => {
    visit = chooseObject(visit, drawer.objects[0].id);
  });

  assert.throws(
    () => chooseObject(visit, drawers[0].objects[0].id),
    /visit is complete/,
  );
});

test("four choices complete a visit and produce a factual exhibit label", () => {
  let visit = createVisit();

  drawers.forEach((drawer, index) => {
    visit = chooseObject(visit, drawer.objects[index % drawer.objects.length].id);
  });

  assert.equal(isComplete(visit), true);
  assert.equal(getCurrentDrawer(visit), null);

  const label = createExhibitLabel(visit);
  assert.equal(label.title, "Four Disagreements");
  assert.equal(label.entries.length, 4);
  assert.match(label.introduction, /record/i);
  label.entries.forEach((entry) => {
    assert.ok(entry.drawer.length > 0);
    assert.ok(entry.visitorChoice.length > 0);
    assert.ok(entry.cabinetChoice.length > 0);
  });
});

test("an incomplete visit cannot produce a final label", () => {
  assert.throws(
    () => createExhibitLabel(createVisit()),
    /visit is not complete/,
  );
});
