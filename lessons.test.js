import test from "node:test";
import assert from "node:assert/strict";
import { lessons, paths, getLesson, evaluateExercise } from "../server/lessons.js";

test("curriculum has unique lesson IDs and valid paths", () => {
  assert.equal(new Set(lessons.map(lesson => lesson.id)).size, lessons.length);
  for (const lesson of lessons) {
    assert.ok(paths.some(path => path.id === lesson.path), `Missing path for ${lesson.id}`);
    assert.ok(lesson.exercise?.checks?.length);
    assert.ok(lesson.quiz?.options?.length >= 2);
  }
});

test("lesson lookup returns a lesson or undefined", () => {
  assert.equal(getLesson("hello-luau").title, "Your first Luau program");
  assert.equal(getLesson("not-a-real-lesson"), undefined);
});

test("exercise evaluator accepts expected behavior for starter exercises", () => {
  assert.equal(evaluateExercise(getLesson("hello-luau"), 'print("CodeBuddy is awesome!")').passed, true);
  assert.equal(evaluateExercise(getLesson("variables"), "local coins = 25\nprint(coins)").passed, true);
  assert.equal(evaluateExercise(getLesson("functions"), "local function double(n)\n return n * 2\nend").passed, true);
});

test("exercise evaluator rejects oversized and incomplete submissions", () => {
  assert.equal(evaluateExercise(getLesson("hello-luau"), "x".repeat(12001)).passed, false);
  assert.equal(evaluateExercise(getLesson("variables"), "print('nothing')").passed, false);
});
