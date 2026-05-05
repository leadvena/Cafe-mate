import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, type, data } = req.body;

    let htmlContent = '';

    if (type === 'welcome') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w-xl: 600px; margin: 0 auto; color: #2C1A0E;">
          <h2>Welcome to CafeMate, ${data.cafeName}!</h2>
          <p>Your artisanal digital menu is almost ready. We are excited to help you elevate your guest experience.</p>
          <p>Access your dashboard here: <a href="https://cafemate.com/dashboard">cafemate.com/dashboard</a></p>
          <br/>
          <p>Cheers,<br/>The CafeMate Team</p>
        </div>
      `;
    } else if (type === 'upgrade_request') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w-xl: 600px; margin: 0 auto; color: #2C1A0E;">
          <h2 style="color: #10B981;">New Upgrade Request!</h2>
          <p><strong>Cafe:</strong> ${data.cafeName}</p>
          <p><strong>GCash Reference:</strong> <span style="font-family: monospace; font-size: 1.2em;">${data.referenceNumber}</span></p>
          <hr style="border: 1px solid #eee; margin: 20px 0;"/>
          <p>Please check your GCash app. If the payment of ₱599 is verified, log into Firebase and set <code>isPremium: true</code> for this cafe.</p>
        </div>
      `;
    } else {
      htmlContent = `<p>New notification from CafeMate.</p>`;
    }

    const dataRes = await resend.emails.send({
      from: 'CafeMate <onboarding@resend.dev>', // resend.dev is for testing
      to: [to],
      subject: subject || 'Notification from CafeMate',
      html: htmlContent,
    });

    return res.status(200).json(dataRes);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
