export const forgotPasswordTemplate = (name, resetUrl) => {

  return `
    <h2>Password Reset Request</h2>

    <p>Hello ${name},</p>

    <p>
      We received a request to reset your password.
    </p>

    <p>
      Click the link below to reset your password:
    </p>

    <a href="${resetUrl}">
      Reset Password
    </a>

    <p>
      This link will expire in 15 minutes.
    </p>

    <p>
      If you did not request this,
      please ignore this email.
    </p>
  `;
};