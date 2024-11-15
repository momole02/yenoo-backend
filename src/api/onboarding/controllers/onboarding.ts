/**
 * A set of functions called "actions" for `onboarding`
 */

import Joi from "joi";
import bcrypt from "bcrypt"
import logging from "logging"

const logger = logging("Onboarding API")

export default {

  signup: async (ctx, next) => {

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      enterpriseName: Joi.string(),
      phone: Joi.string(),
      job: Joi.string(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })

    const result = schema.validate(
      ctx.request.body
    )
    if (result.error) {
      logger.error("signup() : validation error", result.error)
      ctx.throw(400, "Bad request", { message: result.error.message })
      return;
    }

    const authRoleRes = await strapi.documents("plugin::users-permissions.role").findMany({
      filters: {
        name: {
          $eqi: "authenticated"
        }
      }
    })

    if (!authRoleRes.length) {
      logger.error("signup(): authenticated role not found. stop !")
      ctx.throw(500, "Internal server error")
    }

    const authenticated = authRoleRes[0]

    const data = result.value
    const passwordHash = await bcrypt.hash(data.password, 10)
    console.log({
      password: data.password,
      passwordHash,
    })
    const user = await strapi.documents("plugin::users-permissions.user").create({
      data: {
        username: data.email,
        email: data.email,
        role: authenticated.id,
        firstName: data.firstName,
        lastName: data.lastName,
        enterpriseName: data.enterpriseName,
        job: data.job,
        is2FAEnabled: true,
        // password: passwordHash,
        pwd: passwordHash,
        phone: data.phone,
        confirmed: true,
        blocked: false,
      }
    })

    logger.info(`created user: ${data.lastName} ${data.firstName}`)

    const {
      username,
      phone,
      email,
      firstName,
      lastName,
      enterpriseName,
      job,
      is2FAEnabled,
    } = user
    ctx.status = 201
    ctx.body = {
      user: {
        username,
        phone,
        email,
        firstName,
        lastName,
        enterpriseName,
        job,
        is2FAEnabled,
      },
    }

  },

  auth: async (ctx, next) => {
    const schema = Joi.object({
      identifier: Joi.string().required(),
      password: Joi.string().required(),
    })

    const result = schema.validate(ctx.request.body)
    if (result.error) {
      logger.error("auth(): validation error", result.error)
      ctx.throw(400, "Validation error", {
        message: result.error.message
      })
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
      logger.error(`auth(): user not found ${data.identifier}`)
      ctx.throw(401, "Invalid credentials",)
      return;
    }

    const user = searchResult[0]
    const res = await bcrypt.compare(data.password, user.pwd)
    console.log({ res })
    if (!res) {
      logger.error(`auth(): invalid password for ${user.firstName} ${user.lastName}`, {
        data,
        dbgSubmittedPassword: data.password,
        dbgPasswordHash: user.password,
      })
      ctx.throw(401, "Invalid credentials")
      return
    }
    console.log({
    })
    if (!user.is2FAEnabled) {
      logger.warn(`2FA auth disabled for user ${user.firstName} ${user.lastName} `)
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
      const twoFactorAuthCode = `${Math.ceil(Math.random() * 90000 + 10000)}`;
      logger.info(`going for 2FA auth for ${user.firstName} ${user.lastName}`, {
        twoFactorAuthCode
      })
      strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId,
        data: {
          twoFactorAuthCode,
        }
      })
      const {
        username,
        email,
        phone,
        firstName,
        lastName,
        enterpriseName,
        job,
        is2FAEnabled,
      } = user
      ctx.status = 202 // Accepted
      ctx.body = {
        user: {
          username,
          email,
          phone,
          firstName,
          lastName,
          enterpriseName,
          job,
          is2FAEnabled,
        }
      }
    }
  },

  twoFactorAuth: async (ctx, next) => {
    const schema = Joi.object({
      identifier: Joi.string().required(),
      otp: Joi.string().required(),
    })

    const result = schema.validate(ctx.request.body)
    if (result.error) {
      logger.error("twoFactorAuth(): validation error", {
        error: result.error,
      })
      ctx.throw(400, result.error.name, result.error.message)
      return
    }
    const body = result.value

    const searchResult = await strapi.documents("plugin::users-permissions.user").
      findMany({
        filters: {
          $or: [
            { email: body.identifier },
            { phone: body.identifier },
          ],
          twoFactorAuthCode: body.otp,
        }
      })

    if (!searchResult.length) {
      logger.error("twoFactorAuth(): 2fa auth failed", {
        body,
      })
      ctx.throw(403, "2FA Auth failed")
    }

    const user = searchResult[0]
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
  }
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }
};