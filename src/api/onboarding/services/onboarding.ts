import jwt from "jsonwebtoken"
import logging from "logging";

const logger = logging("Onboarding Service")
/**
 * onboarding service
 */

interface IsEmailPhoneUniqueArgs {
    email: string;
    phone: string;
}

interface JwtTokenData {
    documentId: string;
}

export default ({ env }) => ({
    async isEmailPhoneUnique({
        email,
        phone
    }: IsEmailPhoneUniqueArgs) {
        const found = await strapi.documents(
            "plugin::users-permissions.user"
        ).findMany({
            filters: {
                $or: [{
                    email: {
                        $containsi: email
                    },
                }, {
                    phone: {
                        $containsi: phone,
                    }
                }]
            }
        })
        return found.length == 0
    },

    issueJwtToken(data: JwtTokenData) {
        const encoded = JSON.stringify(data)
        const jwtString = jwt.sign(encoded, env("JWT_SECRET"))
        return jwtString
    },

    checkJwtToken(token: string): JwtTokenData {
        try {
            const encoded = jwt.verify(
                token,
                env("JWT_SECRET")
            ) as string

            const decoded = JSON.parse(encoded)
            return decoded as JwtTokenData

        } catch (error) {
            logger.error(
                "checkJwtToken(): failed to verify the JWT token",
                { error }
            )
            return null;
        }
    },

    findAuthenticatedUser(data: JwtTokenData) {
        const result = strapi.documents(
            "plugin::users-permissions.user"
        ).findOne({ documentId: data.documentId })
        return result
    }

});
