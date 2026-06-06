export const orderCancelledTemplate = (
  name,
  orderNumber
) => {
  return `
    <h2>Order Cancelled</h2>
    <p>Hi ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> has been cancelled.</p>
    <p>If this was unexpected, please contact support.</p>
  `;
};