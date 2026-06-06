export const orderPlacedTemplate = (
  name,
  orderNumber,
  grandTotal
) => {
  return `
    <h2>Order Placed Successfully</h2>
    <p>Hi ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
    <p><strong>Total Amount:</strong> ₹${grandTotal}</p>
    <p>Thank you for shopping with Ishop.</p>
  `;
};