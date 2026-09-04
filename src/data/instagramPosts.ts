/**
 * Curated Instagram posts/reels featured on the homepage — via Instagram's
 * official public embed widget (embed.js), NOT the Graph API. No token, no
 * login, no app review, no risk to the account: this only works with
 * public post URLs, the same way embedding an Instagram post in a blog
 * works anywhere on the web.
 *
 * How to add one:
 * 1. Open the post/reel on instagram.com or the Instagram app.
 * 2. Tap "···" → "Copiar enlace" (Copy link).
 * 3. Paste that URL as a new string below.
 *
 * The post must be public. Order here is the order they're shown in — kept
 * newest-first, matching @crunchandmunch_snackbar's own profile grid order
 * as of 2026-09-04. There's no automatic sync: update this list by hand
 * (adding new posts at the top) whenever there's fresh content to feature.
 */
export const INSTAGRAM_POSTS: string[] = [
  'https://www.instagram.com/reel/DT3-0UsjM17/',
  'https://www.instagram.com/reel/DK-jpVhOF64/',
  'https://www.instagram.com/reel/DNeKLdYz9VL/',
  'https://www.instagram.com/reel/Dc1-HJ5Jsxa/',
  'https://www.instagram.com/p/Dcwq2t-iSd1/',
  'https://www.instagram.com/p/DchdEgPpF-9/',
  'https://www.instagram.com/p/DcRt1YLylHM/',
  'https://www.instagram.com/reel/DbmPOxLpuCZ/',
  'https://www.instagram.com/p/Db7B7S3DBee/',
  'https://www.instagram.com/p/DZa86iJiSGN/',
  'https://www.instagram.com/p/DVzBlIJCTOM/',
  'https://www.instagram.com/p/DU8xqmaiWAJ/',
];
