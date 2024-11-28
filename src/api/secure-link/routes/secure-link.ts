/**
 * secure-link router
 */

import { factories } from '@strapi/strapi';
import middlewares from '../../../../config/middlewares';

export default factories.createCoreRouter('api::secure-link.secure-link', {
    config: {
        find: {
            //   middlewares: ["api::onboarding.auth"]
        }
    }
});
