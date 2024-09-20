import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerifyAccountLink = async (
  verifyAccountToken: string,
  to: string
) => {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [to],
    subject: "Verification Email",
    html: `<p>Your verification Link : ${verifyAccountToken}</P>`,
  });
};

export const sendResetPasswordLink = () => {};
