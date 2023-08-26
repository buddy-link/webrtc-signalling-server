import { handler } from "./lib/services/handler";

handler({
  requestContext: {
    routeKey: "$default",
    connectionId: "connection-1",
  },
  body: JSON.stringify({
    type: "subscribe",
    topics: ["topic-1", "topic-2"],
  }),
} as any).then((result) => {
  console.log(result);
});
