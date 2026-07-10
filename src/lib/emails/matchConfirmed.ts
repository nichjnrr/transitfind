export function matchConfirmedEmail(data: {
  recipientName: string;
  lostItemTitle: string;
  foundItemTitle: string;
  matchPercentage: number;
  contactEmail: string;
  itemUrl: string;
}) {
  return {
    subject: `✅ Match confirmed for your lost item: ${data.lostItemTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Good news, ${data.recipientName}!</h2>
        <p>A match has been confirmed for your lost item <strong>${data.lostItemTitle}</strong>.</p>

        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Matched with:</strong> ${data.foundItemTitle}</p>
          <p style="margin: 4px 0 0;"><strong>Match confidence:</strong> ${data.matchPercentage}%</p>
        </div>

        <p>The finder's contact email: <a href="mailto:${data.contactEmail}">${data.contactEmail}</a></p>
        <p>Reach out to them directly to arrange collection.</p>

        <a href="${data.itemUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 8px;">
          View item on TransitFind
        </a>

        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">TransitFind · NUS Orbital 2026</p>
      </div>
    `,
  };
}