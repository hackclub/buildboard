import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        flags: {
            enablePlatform: locals.flags.isEnabled('enable-platform'),
            showSlackButton: locals.flags.isEnabled('show-slack-button'),
        },
    };
};
