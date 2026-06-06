export const orderStatusTemplate = (
  name,
  orderNumber,
  orderStatus
) => {
  return `
    <h2>Order Status Updated</h2>
    <p>Hi ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> is now <strong>${orderStatus}</strong>.</p>
    <p>Thank you for shopping with Ishop.</p>
  `;
};