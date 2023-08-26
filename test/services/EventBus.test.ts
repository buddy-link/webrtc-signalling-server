import { mockClient } from "aws-sdk-client-mock";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import "aws-sdk-client-mock-jest";
import EventBus from "../../lib/services/EventBus";

describe("EventBus", () => {
  let eventBus: EventBus;
  let apiClientMock: any;
  let topicsRepository: any;

  beforeEach(() => {
    apiClientMock = mockClient(ApiGatewayManagementApiClient);
    topicsRepository = {
      unsubscribeFromAll: jest.fn(() => Promise.resolve()),
    };
    eventBus = new EventBus(apiClientMock, topicsRepository);
  });

  afterEach(() => {});

  it("can send an event to a connection", async () => {
    const event = {
      type: "pong",
    };

    await eventBus.send("connection-1", event);

    expect(apiClientMock).toHaveReceivedCommandWith(PostToConnectionCommand, {
      ConnectionId: "connection-1",
      Data: JSON.stringify(event),
    });
  });

  it("removes the connection as a receiver if it detects a stale connection", async () => {
    apiClientMock.on(PostToConnectionCommand).rejects({
      message: "Gone",
      statusCode: 410,
    });

    const event = {
      type: "pong",
    };

    await eventBus.send("connection-1", event);

    expect(topicsRepository.unsubscribeFromAll).toHaveBeenCalledWith(
      "connection-1",
    );
  });

  it("throws the error if it receives a non-410 error when sending the event", async () => {
    apiClientMock.on(PostToConnectionCommand).rejects({
      message: "Unprocessable Entity",
      statusCode: 422,
    });

    const event = {
      type: "pong",
    };

    await expect(eventBus.send("connection-1", event)).rejects.toThrowError(
      "Unprocessable Entity",
    );
  });
});
