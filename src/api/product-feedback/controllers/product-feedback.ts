/**
 * product-feedback controller
 */

import { factories } from '@strapi/strapi'
import Joi from "joi";
import logging from "logging";

const log = logging("Product feedback / api");
export default factories.createCoreController('api::product-feedback.product-feedback',
    ({strapi}) => ({
        create: async (ctx, next) => {
            const schema = Joi.object({
                data: {
                    rating: Joi.number().required(),
                    feedback: Joi.string().required(),
                    product: Joi.string().required(),
                }
            })

            const result = schema.validate(ctx.request.body)
            if(result.error) {
                log.error(result.error)
                ctx.status = 400
                ctx.body = {
                    name: result.error.name,
                    message: result.error.message,
                }
                return;
            }
            const { data } = ctx.request.body;
            await strapi.documents("api::product-feedback.product-feedback")
                .create({
                    data: {
                        rating: data.rating,
                        feedback: data.feedback,
                        product: data.product,
                        user: ctx.state.user.documentId,
                    }
                })
            ctx.status = 201;
        }
    }));
