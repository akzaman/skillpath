export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };
  const from =
    process.env.EMAIL_FROM?.trim() || "National Education Center <beth.t@example.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return { ok: false, error: `${response.status} ${body.slice(0, 200)}` };
  }
  return { ok: true };
}

export function siteUrl(): string {
  return (process.env.BETTER_AUTH_URL || "https://skillpath-lac.vercel.app").replace(/\/$/, "");
}
