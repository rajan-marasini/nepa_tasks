import { describe, expect, it } from "bun:test";
import { eventEmitter } from "@/lib/event-emitter";

describe("EventEmitter", () => {
  it("should emit and handle event:created events", (done) => {
    const mockEvent = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      user_id: "user_test",
      event_type: "login",
      payload: { browser: "Chrome" },
      timestamp: new Date(),
    };

    const handler = (payload: typeof mockEvent) => {
      expect(payload.id).toBe(mockEvent.id);
      expect(payload.user_id).toBe("user_test");
      eventEmitter.removeListener("event:created", handler);
      done();
    };

    eventEmitter.on("event:created", handler);
    eventEmitter.emit("event:created", mockEvent);
  });
});
