import assert from "node:assert/strict";
import test from "node:test";
import { normalizeNotifications } from "./notification-service.ts";

const VALID_NOTIFICATION = {
  id: "notice-1",
  type: "official-notice",
  title: "Aviso",
  message: "Información importante",
  priority: "high",
  createdAt: "2026-07-23T12:00:00.000Z",
};

test("descarta formatos antiguos que no son listas", () => {
  assert.deepEqual(normalizeNotifications({ items: [VALID_NOTIFICATION] }), []);
  assert.deepEqual(normalizeNotifications("invalid"), []);
  assert.deepEqual(normalizeNotifications(null), []);
});

test("conserva únicamente notificaciones válidas", () => {
  assert.deepEqual(
    normalizeNotifications([VALID_NOTIFICATION, null, {}, { ...VALID_NOTIFICATION, id: 4 }]),
    [VALID_NOTIFICATION],
  );
});
