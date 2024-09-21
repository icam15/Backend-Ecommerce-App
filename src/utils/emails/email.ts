import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerifyAccountLink = async (
  verifyAccountToken: string,
  to: string
) => {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [to],
    subject: "Verification Account",
    html: `<p>Your verification Link : https//:clinet-url/verication-account?token=${verifyAccountToken}</P>`,
  });
};

export const sendResetPasswordLink = async (
  resetPasswordToken: string,
  to: string
) => {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [to],
    subject: "Verification Account",
    html: `<p>Your verification Link : https//:client-url/reset-password?token=${resetPasswordToken}</P>`,
  });
};