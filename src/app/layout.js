import "./globals.css";
import Header from "./components/Header"

export const metadata = {
  title: "Wikipedia",
  description: "Movie Wikipedia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <Header>
        
        </Header>
      
        {children}
      </body>
    </html>
  );
}
