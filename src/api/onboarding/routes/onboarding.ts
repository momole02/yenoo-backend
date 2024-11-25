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

    {
      method: 'POST',
      path: '/account-details',
      handler: 'onboarding.updateAccountDetails',
      config: {
        policies: [],
        middlewares: ["api::onboarding.auth"],
      },
    },


    {
      method: 'GET',
      path: '/account-details',
      handler: 'onboarding.getAccountDetails',
      config: {
        policies: [],
        middlewares: ["api::onboarding.auth"],
      },
    },


    {
      method: 'POST',
      path: '/change-password',
      handler: 'onboarding.changePassword',
      config: {
        policies: [],
        middlewares: ["api::onboarding.auth"],
      },
    },

    // {
    //   method: 'GET',
    //   path: '/onboarding',
    //   handler: 'onboarding.exampleAction',
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //   },
    // },
  ],
};
