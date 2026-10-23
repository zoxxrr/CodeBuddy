import test from "node:test";
import assert from "node:assert/strict";

function calculateStreak(lastDate, currentStreak, today) {
  if (lastDate === today) return currentStreak;
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return lastDate === yesterday.toISOString().slice(0, 10) ? currentStreak + 1 : 1;
}

test("streak does not increase more than once per day", () => {
  assert.equal(calculateStreak("2026-10-23", 4, "2026-10-23"), 4);
});

test("streak continues on the following day", () => {
  assert.equal(calculateStreak("2026-10-22", 4, "2026-10-23"), 5);
});

test("streak restarts after a missed day", () => {
  assert.equal(calculateStreak("2026-10-20", 4, "2026-10-23"), 1);
});
