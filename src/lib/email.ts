import nodemailer from 'nodemailer';

const cleanEnv = (val?: string) => val ? val.replace(/^["']|["']$/g, '') : '';

function getTransporter() {
  const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.mailtrap.io';
  const port = parseInt(cleanEnv(process.env.SMTP_PORT) || '2525');
  const user = cleanEnv(process.env.SMTP_USER);

  let pass = cleanEnv(process.env.SMTP_PASS);
  if (host.includes('resend') && process.env.RESEND_API_KEY) {
    pass = cleanEnv(process.env.RESEND_API_KEY);
  }

  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendInvoiceReminder(to: string, invoiceName: string, dueDate: string) {
  try {
    const user = cleanEnv(process.env.SMTP_USER);
    await getTransporter().sendMail({
      from: cleanEnv(process.env.SMTP_FROM) || (user ? `"Invoxa Billing" <${user}>` : '"Invoxa Billing" <billing@invoxa.com>'),
      to,
      subject: `Payment Reminder: Invoice ${invoiceName} Due Soon`,
      text: `This is a reminder that your invoice ${invoiceName} is due on ${dueDate}. Please arrange for payment to avoid late fees.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice Reminder</h2>
          <p>This is a reminder that your invoice <strong>${invoiceName}</strong> is due on <strong>${dueDate}</strong>.</p>
          <p>Please arrange for payment to avoid late fees.</p>
          <br/>
          <p>Thank you,<br/>Settlr Billing Team</p>
        </div>
      `,
    });
    console.log(`Reminder email sent to ${to} for invoice ${invoiceName}`);
  } catch (error) {
    console.error('Failed to send email reminder:', error);
  }
}

export async function sendWorkspaceInvite(
  to: string,
  workspaceName: string,
  inviterName: string,
  role: string,
  expiryDays: number,
  inviteLink: string
) {
  try {
    const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.mailtrap.io';
    const port = parseInt(cleanEnv(process.env.SMTP_PORT) || '2525');
    const user = cleanEnv(process.env.SMTP_USER);
    let pass = cleanEnv(process.env.SMTP_PASS);
    if (host.includes('resend') && process.env.RESEND_API_KEY) {
      pass = cleanEnv(process.env.RESEND_API_KEY);
    }

    console.log('\n==================================================');
    console.log(`WORKSPACE INVITATION TO: ${to}`);
    console.log(`INVITATION LINK: ${inviteLink}`);
    console.log('SMTP CONFIG IN USE:', {
      host,
      port,
      user,
      passLength: pass?.length,
      passStart: pass?.substring(0, 5),
    });
    console.log('==================================================\n');

    await getTransporter().sendMail({
      from: cleanEnv(process.env.SMTP_FROM) || (user ? `"Invoxa Accounts" <${user}>` : '"Invoxa Accounts" <accounts@invoxa.com>'),
      to,
      subject: `You have been invited to join ${workspaceName} on Settlr`,
      text: `${inviterName} has invited you to join the workspace "${workspaceName}" as an ${role}. Please log in or sign up to accept the invitation: ${inviteLink}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #fafafa;">
          <h2 style="color: #171717; margin-bottom: 16px;">You've been invited!</h2>
          <p style="color: #404040; line-height: 1.6; margin-bottom: 24px;">
            <strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong> as an <strong>${role}</strong>.
          </p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-bottom: 24px;">
            Join Workspace
          </a>
          <p style="color: #737373; font-size: 14px; line-height: 1.5;">
            This invitation will expire in ${expiryDays} days. If you don't have an Settlr account, one will be created when you log in.
          </p>
        </div>
      `,
    });
    console.log(`Workspace invite email sent to ${to} for workspace ${workspaceName}`);
  } catch (error) {
    console.error('Failed to send workspace invite:', error);
  }
}
