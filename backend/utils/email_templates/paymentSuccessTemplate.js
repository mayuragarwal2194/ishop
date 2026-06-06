export const paymentSuccessTemplate = (
  name,
  orderNumber,
  amount
) => {
  return `
    <h2>Payment Successful</h2>
    <p>Hi ${name},</p>
    <p>Your payment for order <strong>${orderNumber}</strong> was successful.</p>
    <p><strong>Amount Paid:</strong> ₹${amount}</p>
    <p>Thank you for shopping with Ishop.</p>
  `;
};