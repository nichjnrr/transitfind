// src/lib/emails/passwordReset.ts
export function passwordResetEmail(data: {
  recipientName: string;
  resetUrl: string;
}) {
  return {
    subject: "Reset your TransitFind password",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Password reset requested</h2>
        <p>Hi ${data.recipientName},</p>
        <p>We received a request to reset your TransitFind password. Click the button below to choose a new one. This link expires in one hour.</p>
        <a href="${data.resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin: 12px 0;">
          Reset my password
        </a>
        <p style="color: #6b7280; font-size: 13px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">TransitFind · NUS Orbital 2026</p>
      </div>
    `,
  };
}
