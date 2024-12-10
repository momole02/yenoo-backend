export default ({ env }) => ({
  mailjet: {
    apiKey: env("MAILJET_API_KEY", "2c78f4fe677b0f6f07ae5b19e2fda733"),
    secret: env("MAILJET_API_SECRET", "ff966e3aee631811cd239779d5a7191f"),
    sender: {
      email: env("MAILJET_SENDER_EMAIL", "mol02office@gmail.com"),
      name: env("MAILJET_SENDER_NAME", "Yenoo Team"),
    },
  },
  secureLinks: {
    tokenLength: env("SL_TOKEN_LENGTH", 6),
  },
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
})