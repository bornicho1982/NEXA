export type LogLevel = "info" | "warn" | "error" | "debug";

const isProd = process.env.NODE_ENV === "production";

class Logger {
    private format(level: LogLevel, message: string, meta?: unknown) {
        const timestamp = new Date().toISOString();
        if (isProd) {
            return JSON.stringify({ level, timestamp, message, meta });
        } else {
            // Dev format
            const colors = {
                info: "\x1b[36m", // Cyan
                warn: "\x1b[33m", // Yellow
                error: "\x1b[31m", // Red
                debug: "\x1b[90m", // Gray
            };
            const reset = "\x1b[0m";
            const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : "";
            return `${colors[level]}[${level.toUpperCase()}] ${message}${reset}${metaStr}`;
        }
    }

    info(message: string, meta?: unknown) {
        console.log(this.format("info", message, meta));
    }

    warn(message: string, meta?: unknown) {
        console.warn(this.format("warn", message, meta));
    }

    error(message: string, meta?: unknown) {
        console.error(this.format("error", message, meta));
    }

    debug(message: string, meta?: unknown) {
        if (!isProd) {
            console.debug(this.format("debug", message, meta));
        }
    }
}

export const logger = new Logger();
