export const verifyEmailTemplate =
  (name, verificationUrl) => {

    return `
      <h2>Welcome to Ishop, ${name}!</h2>

      <p>Please verify your email address:</p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>This link expires in 24 hours.</p>
    `;
  };