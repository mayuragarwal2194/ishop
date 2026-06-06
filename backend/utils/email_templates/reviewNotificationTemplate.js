export const reviewNotificationTemplate = (
  name,
  title,
  message
) => {
  return `
    <h2>${title}</h2>
    <p>Hi ${name},</p>
    <p>${message}</p>
    <p>Thank you for sharing your feedback with Ishop.</p>
  `;
};