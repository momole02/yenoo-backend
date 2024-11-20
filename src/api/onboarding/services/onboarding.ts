/**
 * onboarding service
 */

interface IsEmailPhoneUniqueArgs {
    email: string;
    phone: string;
}
export default () => ({
    async isEmailPhoneUnique({
        email,
        phone
    }: IsEmailPhoneUniqueArgs) {
        const found = await strapi.documents(
            "plugin::users-permissions.user"
        ).findMany({
            filters: {
                $or: [
                    {
                        email: {
                            $containsi: email
                        },
                    }, {
                        phone: {
                            $containsi: phone,
                        }
                    }]
            }
        })
        return found.length == 0
    }
});
