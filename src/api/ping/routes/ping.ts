export default {
  routes: [
    {
      method: 'GET',
      path: '/ping',
      handler: 'ping.ping',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
