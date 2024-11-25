import { JwtTokenData } from "../api/onboarding/services/onboarding"

const isSecureLink = async (url: string) => {

    const allSecureLinks = await strapi
        .documents("api::secure-link.secure-link")
        .findMany()

    for (const link of allSecureLinks) {
        if (url.includes(link.urlPattern)) {
            return link
        }
    }
    return null
}

const writeSecureLinkAccess = async (secureLink: any, user: any) => {
    await strapi.documents(
        "api::secure-link-access.secure-link-access"
    ).create({
        data: {
            userDocumentId: user.documentId,
            secureLinkDocumentId: secureLink.documentId,
            userFullName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            userPhone: user.phone,
            secureLinkLabel: secureLink.label,
            secureLinkUrl: secureLink.patternUrl,
        }
    })
}
export default (config) => {
    return async (context, next) => {

        let secureLink;
        if (context.request.url.match(/uploads/)
            && (secureLink = await isSecureLink(context.request.url))) {

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
                    await writeSecureLinkAccess(secureLink, user)
                    return next()
                }
            }
        }
        return next()
    }
}