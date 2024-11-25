import logging from "logging"
import { JwtTokenData } from "../services/onboarding"

const logger = logging("onboarding / middlewares / auth")

export default (config,) => {
    return async (context, next) => {
        const authorization = context
            .request
            .headers["authorization"] as string

        const match = authorization.match(/^bearer (.+)/i)
        if (match) {
            const token = match[1]
            const data = await strapi.service("api::onboarding.onboarding").
                checkJwtToken(token) as JwtTokenData

            if (data) {
                const user = await strapi.documents("plugin::users-permissions.user")
                    .findOne({
                        documentId: data.documentId
                    })
                if (user) {
                    context.user = user;
                }
            }
        } else {
            logger.warn("unreconized authorization format", { authorization })
        }
        await next()
    }
}