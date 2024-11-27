/**
 * secure-link controller
 */

import { factories } from '@strapi/strapi'
import axios, { AxiosError } from 'axios';
import logging from 'logging';

const logger = logging("secure-link / controllers")

export default factories.createCoreController('api::secure-link.secure-link', ({ strapi }) => ({
    async find(ctx) {
        try {
            if (!ctx.user) {
                logger.error("access(): missing user in the context !")
                ctx.status = 500
                return;
            }
            const user = ctx.user

            const { slug } = ctx.query
            if (!slug) {
                logger.warn("access(): missing slug")
                ctx.status = 400
                return;
            }

            const links = await strapi.documents(
                "api::secure-link.secure-link"
            ).findMany({
                filters: {
                    slug,
                }
            })

            if (!links.length) {
                logger.warn("access(): link not found ", { slug })
                ctx.status = 404
                return
            }

            const link = links[0]
            const resp = await axios.get(link.url,
                link.stream ? {
                    responseType: "stream",
                } : {},
            )

            if (link.track) {
                await strapi.documents(
                    "api::secure-link-access.secure-link-access"
                ).create({
                    data: {
                        user: user.documentId,
                        secure_link: link.documentId,
                    }
                })
            }

            ctx.status = resp.status
            for (const header in resp.headers) {
                if ([
                    "content-type",
                    "content-disposition",
                ].includes(header.toLowerCase())) {
                    ctx.set(
                        header, resp.headers[header],
                    )
                }
            }
            ctx.body = resp.data
        } catch (error) {
            if (error instanceof AxiosError) {
                logger.warn("find(): can't reach the secure link endpoint (request error)", {
                    error: error.message,
                })
                ctx.status = error.response?.status ?? 500
            } else {
                logger.error("find(): unhandled error", { error })
                ctx.status = 500
            }
        }


    }
}));
