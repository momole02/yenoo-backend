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

export interface JwtTokenData {
    documentId: string;
    id: string;
}

export default () => ({
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
        // const jwtString = jwt.sign(
        //     encoded,
        //     strapi.config.get("plugin::users-permissions.jwtSecret")
        // )
        const jwtString = strapi.plugins["users-permissions"]
            .services
            .jwt
            .issue(data)

        return jwtString
    },

    checkJwtToken(token: string): JwtTokenData {
        try {
            const data = jwt.verify(
                token,
                strapi.config.get("plugin::users-permissions.jwtSecret"),
            )

            //const decoded = JSON.parsedata=
            return data as JwtTokenData

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
    },

    async updateAccount(userDocumentId: string, data: any) {
        try {
            const result = await strapi.documents("plugin::users-permissions.user").update({
                documentId: userDocumentId,
                data,
            })
            console.log({ result })
            return result
        } catch (error) {
            return null
        }
    }
});
