export async function getRecaptchaToken(action: string) {
  if (!window.grecaptcha) return null;

  return await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action });
}
