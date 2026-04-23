import 'remixicon/fonts/remixicon.css'
import "./globals.css";
import { quicksand } from "@/fonts";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='bg-[#e2e4eb]'>{children}</body>
    </html>
  );
}
