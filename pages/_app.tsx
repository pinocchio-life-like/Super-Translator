import { useUserId } from "../app/hooks/useUserId";
import { AuthProvider } from "../app/context/AuthContext";
import { TranslationProvider } from "../app/context/TranslationContext";
import type { AppProps } from "next/app";
import "../app/globals.css";
import GuestPage from "@/app/components/GuestPage";

function MyApp({ Component, pageProps }: AppProps) {
  const userId = useUserId();
  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen">
        <GuestPage />
      </div>
    );
  }
  return (
    <AuthProvider>
      <TranslationProvider id={userId}>
        <Component {...pageProps} />
      </TranslationProvider>
    </AuthProvider>
  );
}

export default MyApp;
