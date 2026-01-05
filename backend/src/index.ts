import { DurableObject } from 'cloudflare:workers';
import z from 'zod';
import { checkDeathThreat } from './ai';

export class DeathchatRoom extends DurableObject {
  async fetch() {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  broadcast({ message, user }: { message: string; user: string }) {
    message = message.replace('&', '&smp;').replace('<', '&lt;');
    const websockets = this.ctx.getWebSockets();
    for (const websocket of websockets) {
      try {
        websocket.send(
          JSON.stringify({
            id: Date.now(),
            type: 'message',
            message,
            user,
          })
        );
      } catch {}
    }
  }
}

const SendMessageSchema = z.object({
  message: z.string().nonempty(),
  user: z.string().nonempty(),
});

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/send') {
      const data = SendMessageSchema.parse(await request.json());

      const object = env.ROOM.getByName('main');

      const result = await checkDeathThreat(data.message);
      if (!result.has_death_threat) {
        return Response.json({ success: false, reasoning: result.reasoning }, { status: 400 });
      }

      await object.broadcast(data);

      return Response.json({ success: true });
    }

    if (url.pathname === '/api/socket') {
      const object = env.ROOM.getByName('main');

      return object.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
