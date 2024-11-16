export default {
  routes: [

    {
      method: 'POST',
      path: '/auth',
      handler: 'onboarding.auth',
      config: {
        policies: [],
        middlewares: [],
      },
    },


    {
      method: 'POST',
      path: '/signup',
      handler: 'onboarding.signup',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'POST',
      path: '/two-factor-auth',
      handler: 'onboarding.twoFactorAuth',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // {
    //  method: 'GET',
    //  path: '/onboarding',
    //  handler: 'onboarding.exampleAction',
    //  config: {
    //    policies: [],
    //    middlewares: [],
    //  },
    // },
  ],
};
