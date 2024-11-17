/**
 * A set of functions called "actions" for `ping`
 */

export default {
  ping: async (ctx, next) => {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  }
};
