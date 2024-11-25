import jwt from "jsonwebtoken"
import logging from "logging";
import mj from "node-mailjet";
import { IsEmailPhoneUniqueArgs, JwtTokenData, SendOTPEmailArgs } from "../types";


const logger = logging("onboarding / services")
/**
 * onboarding service
 */

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
    },

    async sendOTPEmail({
        userDocumentId,
    }: SendOTPEmailArgs) {

        try {
            const user = await strapi
                .documents("plugin::users-permissions.user")
                .findOne(
                    { documentId: userDocumentId }
                )
            if (!user) {
                logger.warn(`sendOTPEmail(): User with documentId=${userDocumentId} not fould`)
            }

            const mailjet = mj.apiConnect(
                strapi.config.get("api.mailjet.apiKey"),
                strapi.config.get("api.mailjet.secret")
            )
            await mailjet.post(
                "send", { version: "v3.1" }
            ).request({
                "Messages": [
                    {
                        "From": {
                            "Email": strapi.config.get("api.mailjet.sender.email"),
                            "Name": strapi.config.get("api.mailjet.sender.name")
                        },
                        "To": [
                            {
                                "Email": user.email,
                                "Name": `${user.firstName} ${user.lastName}`
                            }
                        ],
                        "TemplateID": 6503797,
                        "TemplateLanguage": true,
                        "Subject": "Your One Time Password",
                        "Variables": {
                            "otp": user.twoFactorAuthCode,
                            "Recipient_Name": `${user.firstName} ${user.lastName}`,
                        }

                    }
                ]
            })
            logger.info(`OTP [${user.twoFactorAuthCode}] Sent to [${user.email}] `)
            return true
        } catch (error) {
            logger.error(
                "sendOTPEmail(): An error occured while sending OTP email",
                error)
            return false
        }
    }


});
