import { handleDefault } from "../../lib/services/handleDefault";

describe("Default", () => {
  let log: any;
  let topicsRepository: any;
  let eventBus: any;

  beforeEach(() => {
    log = jest.spyOn(console, "log").mockImplementation(() => {});
    topicsRepository = {
      unsubscribeFromAll: jest.fn(() => Promise.resolve()),
      unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
      subscribeToTopic: jest.fn(() => Promise.resolve()),
      getReceiversForTopic: jest.fn(() => Promise.resolve([])),
    };
    eventBus = {
      send: jest.fn(() => Promise.resolve()),
    };
  });

  afterEach(() => {
    log.mockReset();
  });

  it("logs that a client sent a message", async () => {
    const event = {
      type: "unsubscribe",
      topics: ["topic-1", "topic-2"],
    } as any;

    await handleDefault("connection-id", event, topicsRepository, eventBus);

    expect(log).toBeCalledWith("Handling unsubscribe event.");
  });

  it("handles the unsubscribe event", async () => {
    const unsubscribeEvent = {
      type: "unsubscribe",
      topics: ["topic-1", "topic-2"],
    } as any;

    await handleDefault(
      "connection-1",
      unsubscribeEvent,
      topicsRepository,
      eventBus,
    );

    expect(topicsRepository.unsubscribeFromTopic).toHaveBeenCalledWith(
      "topic-1",
      "connection-1",
    );
    expect(topicsRepository.unsubscribeFromTopic).toHaveBeenCalledWith(
      "topic-2",
      "connection-1",
    );
  });

  it("handles the subscribe event", async () => {
    const subscribeEvent = {
      type: "subscribe",
      topics: ["topic-1", "topic-2"],
    } as any;

    await handleDefault(
      "connection-1",
      subscribeEvent,
      topicsRepository,
      eventBus,
    );

    expect(topicsRepository.subscribeToTopic).toHaveBeenCalledWith(
      "topic-1",
      "connection-1",
    );
    expect(topicsRepository.subscribeToTopic).toHaveBeenCalledWith(
      "topic-2",
      "connection-1",
    );
  });

  it("handles the ping event", async () => {
    const pingEvent = {
      type: "ping",
    } as any;

    await handleDefault("connection-1", pingEvent, topicsRepository, eventBus);

    expect(eventBus.send).toHaveBeenCalledWith("connection-1", {
      type: "pong",
    });
  });

  it("handles the publish event", async () => {
    const publishEvent = {
      type: "publish",
      topic: "topic-1",
      message: "This is a messsage.",
      from: "Jane Doe",
    } as any;

    topicsRepository.getReceiversForTopic.mockImplementationOnce(() =>
      Promise.resolve(["connection-1", "connection-2", "connection-3"]),
    );

    await handleDefault(
      "connection-1",
      publishEvent,
      topicsRepository,
      eventBus,
    );

    expect(eventBus.send).toHaveBeenCalledWith("connection-1", publishEvent);
    expect(eventBus.send).toHaveBeenCalledWith("connection-2", publishEvent);
    expect(eventBus.send).toHaveBeenCalledWith("connection-3", publishEvent);
  });

  it("does nothing if the event has no type", async () => {
    await expect(
      handleDefault(
        "connection-1",
        undefined as any,
        topicsRepository,
        eventBus,
      ),
    ).resolves.not.toThrowError();
  });
});
