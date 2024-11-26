/**
 * secure-link controller
 */

import { factories } from '@strapi/strapi'
import axios from 'axios';
import logging from 'logging';

const logger = logging("secure-link / controllers")

export default factories.createCoreController('api::secure-link.secure-link', ({ strapi }) => ({
    async access(ctx) {
        if (!ctx.user) {
            logger.error("access(): missing user in the context !")
            ctx.status = 500
            return;
        }

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
            logger.warn("access(): link not foud ", { slug })
            ctx.status = 404
            return
        }

        const resp = await axios.get(
            links[0].url,
        )

        ctx.status = resp.status
        ctx.headers["content-type"] = resp.headers["Content-Type"].toString()
        ctx.body = resp.data

    }
}));
