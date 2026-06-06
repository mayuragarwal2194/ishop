export const paymentFailedTemplate = (
  name,
  orderNumber
) => {
  return `
    <h2>Payment Failed</h2>
    <p>Hi ${name},</p>
    <p>Your payment for order <strong>${orderNumber}</strong> has failed.</p>
    <p>You can try again from your orders page.</p>
  `;
};