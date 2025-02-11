import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface"

export const corsConfig = (): CorsOptions => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || []

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization"],
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
  }
}
