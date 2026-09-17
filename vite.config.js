import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createAvatarSession } from './api/avatar-session.js';

function avatarSessionDevPlugin(environment) {
  return {
    name: 'avatar-session-dev-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/avatar-session', async (request, response, next) => {
        if (request.method !== 'POST') {
          if (request.method === 'GET') {
            response.statusCode = 405;
            response.setHeader('Allow', 'POST');
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          next();
          return;
        }

        response.setHeader('Cache-Control', 'no-store, max-age=0');
        response.setHeader('Content-Type', 'application/json');

        try {
          const session = await createAvatarSession(environment);
          response.statusCode = 200;
          response.end(JSON.stringify(session));
        } catch (error) {
          server.config.logger.error(error instanceof Error ? error.stack : String(error));
          const configurationError = error instanceof Error && error.message.endsWith('must be set');
          response.statusCode = configurationError ? 503 : 502;
          response.end(JSON.stringify({
            error: configurationError
              ? 'Video chat is not configured yet.'
              : 'Video chat could not be started. Please try again.',
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), avatarSessionDevPlugin(environment)],
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: true,
    },
  };
});
