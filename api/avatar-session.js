const DEFAULT_ANAM_API_BASE = "https://api.anam.ai";

function requiredEnvironment(environment, name) {
  const value = environment[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
}

export async function createAvatarSession(environment = process.env) {
  const anamApiKey = requiredEnvironment(environment, "ANAM_API_KEY");
  const anamApiBase = environment.ANAM_API_BASE || DEFAULT_ANAM_API_BASE;
  const avatarId = requiredEnvironment(environment, "ANAM_AVATAR_ID");
  const elevenLabsApiKey = requiredEnvironment(environment, "ELEVENLABS_API_KEY");
  const agentId = requiredEnvironment(environment, "ELEVENLABS_AGENT_ID");

  const signedUrlResponse = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    {
      headers: { "xi-api-key": elevenLabsApiKey },
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!signedUrlResponse.ok) {
    throw new Error(`ElevenLabs rejected the session request (${signedUrlResponse.status})`);
  }

  const { signed_url: signedUrl } = await signedUrlResponse.json();
  if (!signedUrl) throw new Error("ElevenLabs did not return a signed URL");

  const tokenResponse = await fetch(`${anamApiBase}/v1/auth/session-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anamApiKey}`,
    },
    body: JSON.stringify({
      personaConfig: {
        name: "Narendra",
        avatarId,
        avatarModel: "cara-4",
        directorNotes: {
          presetStyle: "warm",
          expressivity: 0.5,
        },
      },
      environment: {
        elevenLabsAgentSettings: {
          signedUrl,
          agentId,
        },
      },
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Anam rejected the session request (${tokenResponse.status})`);
  }

  const { sessionToken } = await tokenResponse.json();
  if (!sessionToken) throw new Error("Anam did not return a session token");

  return { sessionToken };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await createAvatarSession();
    return response.status(200).json(session);
  } catch (error) {
    console.error("Avatar session creation failed:", error);
    const configurationError = error instanceof Error && error.message.endsWith("must be set");
    return response.status(configurationError ? 503 : 502).json({
      error: configurationError
        ? "Video chat is not configured yet."
        : "Video chat could not be started. Please try again.",
    });
  }
}
