export function itemClaimedEmail(data: {
  recipientName: string;
  foundItemTitle: string;
  claimerEmail: string;
  itemUrl: string;
}) {
  return {
    subject: `📬 Someone has claimed your found item: ${data.foundItemTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Hi ${data.recipientName},</h2>
        <p>Someone has claimed the item you reported as found: <strong>${data.foundItemTitle}</strong>.</p>

        <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Claimer's email:</strong> <a href="mailto:${data.claimerEmail}">${data.claimerEmail}</a></p>
        </div>

        <p>Please reach out to arrange returning the item.</p>

        <a href="${data.itemUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 8px;">
          View item on TransitFind
        </a>

        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">TransitFind · NUS Orbital 2026</p>
      </div>
    `,
  };
}
