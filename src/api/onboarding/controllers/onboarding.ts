/**
 * A set of functions called "actions" for `onboarding`
 */

import Joi from "joi";
import bcrypt from "bcrypt"


export default {
  signup: async (ctx, next) => {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      enterpriseName: Joi.string(),
      job: Joi.string(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })

    const result = schema.validate(
      ctx.request.body
    )
    if (result.error) {
      ctx.throw(400, "Bad request", result.error)
      return;
    }

    const data = result.value

    const user = strapi.documents("plugin::users-permissions.user").create({
      data: {
        username: data.email,
        email: data.email,
        role: "authenticated",
        firstName: data.firstName,
        lastName: data.lastName,
        enterpriseName: data.enterpriseName,
        job: data.job,
        is2FAEnabled: true,
        password: await bcrypt.hash(data.password, 10),
        confirmed: true,
        blocked: false,
      }
    })

    ctx.status = 201
    ctx.body = {
      user,
    }

  },

  auth: async (ctx, next) => {
    const schema = Joi.object({
      identifier: Joi.string().required(),
      password: Joi.string().required(),
    })

    const result = schema.validate(ctx.request.body)
    if (result.error) {
      ctx.throw(400, "Validation error", result.error)
      return;
    }

    const data = result.value
    const searchResult = await strapi.documents("plugin::users-permissions.user").findMany(
      {
        filters: {
          $or: [
            { email: data.identifier },
            { phone: data.identifier },
          ]
        }
      }
    )
    if (!searchResult.length) {
      ctx.throw(401, "Invalid credentials", { data })
      return;
    }

    const user = searchResult[0]
    if (!await bcrypt.compare(data.password, user.password)) {
      ctx.throw(401, "Invalid credentials", { data })
      return
    }
    if (!user.is2FAEnabled) {
      const jwt = strapi.plugins["users-permissions"]
        .services
        .jwt
        .issue({
          id: user.id
        })
      ctx.status = 200 // OK
      ctx.body = {
        jwt, user
      }
    } else {
      const twoFactorAuthCode = `${Math.random() * 90000 + 10000}`;
      strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId,
        data: {
          twoFactorAuthCode,
        }
      })
      ctx.status = 202 // Accepted
      ctx.body = {
        user,
      }
    }
  }
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }
};
