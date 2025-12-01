// import type { PageServerLoad } from './$types';
// import { error, fail, redirect, type Actions } from '@sveltejs/kit';
// import { BEARER_TOKEN_BACKEND } from '$env/static/private';
// import { unhashUserID, getBackendUrl } from '$lib/server/auth';
//
// export const load: PageServerLoad = async ({ params, cookies }) => {
//     try {
//         console.log("Load started for handle:", params.handle);
//         const { handle } = params;
//         let userID: string | undefined;
//
//         const hashedUserID = cookies.get('userID');
//         console.log("Hashed UserID:", hashedUserID);
//
//         if (hashedUserID) {
//             try {
//                 userID = unhashUserID(hashedUserID);
//                 console.log("Unhashed UserID:", userID);
//             } catch (e) {
//                 console.error("Unhash failed:", e);
//                 // Ignore invalid cookie
//             }
//         }
//
//         const headers: Record<string, string> = {
//             'Authorization': `${BEARER_TOKEN_BACKEND}`
//         };
//
//         if (userID) {
//             headers['x-user-id'] = userID;
//         }
//
//         const url = getBackendUrl(`/users/handle/${handle}`);
//         console.log("Fetching URL:", url);
//
//         const response = await fetch(url, {
//             headers
//         });
//
//         console.log("Response status:", response.status);
//
//         if (response.status === 404) {
//             return { error: 'User not found', user: null, isOwner: false };
//         }
//
//         if (response.status === 403) {
//             return { error: 'This profile is private', user: null, isOwner: false };
//         }
//
//         if (!response.ok) {
//             const text = await response.text();
//             console.error("Fetch failed:", text);
//             return { error: `Failed to load profile: ${response.status} ${text}`, user: null, isOwner: false };
//         }
//
//         const user = await response.json();
//         console.log("User fetched:", user.user_id);
//
//         return {
//             user,
//             isOwner: userID === user.user_id
//         };
//     } catch (e: any) {
//         console.error("Load exception:", e);
//         return {
//             error: `Exception: ${e.message}\nStack: ${e.stack}`,
//             user: null,
//             isOwner: false
//         };
//     }
// };
