import { DurableObject } from 'cloudflare:workers';
import z from 'zod';
import { checkDeathThreat } from './ai';

type DBUser = {
  name: string;
  count: number;
};

export class DeathchatRoom extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        name TEXT NOT NULL PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

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
    message = message.replaceAll('&', '&smp;').replaceAll('<', '&lt;');
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
    this.ctx.storage.sql.exec('INSERT INTO users (name, count) VALUES (?, 1) ON CONFLICT (name) DO UPDATE SET count = count + 1', user);
  }

  async getTopUsers(limit: number = 10) {
    return this.ctx.storage.sql.exec<DBUser>('SELECT * FROM users ORDER BY count DESC LIMIT ?', limit).toArray();
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

      if (result.reasoning == "weak") {
        data.message += " >:(";
      } else if (result.reasoning == "strong") {
        data.message += " ✨✨"
      }

      await object.broadcast(data);

      return Response.json({ success: true , reasoning: result.reasoning });
    }

    if (url.pathname === '/api/socket') {
      const object = env.ROOM.getByName('main');

      return object.fetch(request);
    }

    if (url.pathname === '/api/users') {
      const object = env.ROOM.getByName('main');

      return Response.json(await object.getTopUsers());
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
