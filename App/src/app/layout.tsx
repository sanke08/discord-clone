import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Provider";
import ChatProvider from "@/components/chat/ChatProvider";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="  text-white bg-main w-screen min-h-screen">
        <Provider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </Provider>
      </body>
    </html>
  );
}
