export async function sendWelcomeEmail(to: string, cafeName: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: 'Welcome to CafeMate!',
        type: 'welcome',
        data: { cafeName },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendUpgradeRequestEmail(cafeName: string, referenceNumber: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Replace this with the actual admin email you want to receive notifications
        to: import.meta.env.VITE_ADMIN_EMAIL || 'admin@cafemate.com', 
        subject: `New Upgrade Request: ${cafeName}`,
        type: 'upgrade_request',
        data: { cafeName, referenceNumber },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send upgrade email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

