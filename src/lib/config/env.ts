function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        if (typeof window === 'undefined') {
            throw new Error(`Missing required environment variable: ${name}`);
        }
        // On client side, return empty string or throw if critical?
        // Usually sensitive vars are undefined on client. We shouldn't import this on client.
        return '';
    }
    return value;
}

export const env = {
    // Server-side only
    BUNGIE_API_KEY: requireEnv('BUNGIE_API_KEY'),
    BUNGIE_CLIENT_ID: requireEnv('BUNGIE_CLIENT_ID'),
    BUNGIE_CLIENT_SECRET: requireEnv('BUNGIE_CLIENT_SECRET'),
    BUNGIE_REDIRECT_URL: requireEnv('BUNGIE_REDIRECT_URL'),
    DATABASE_URL: requireEnv('DATABASE_URL'),
    SESSION_SECRET: requireEnv('SESSION_SECRET'),

    // Public / Shared
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Optional / Defaults
    OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'gemma3:4b',
} as const;
