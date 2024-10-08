// pages/_app.tsx
import { AuthProvider } from "../app/context/AuthContext";
import { TranslationProvider } from "../app/context/TranslationContext";
import type { AppProps } from "next/app";
import "../app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <TranslationProvider>
        <Component {...pageProps} />
      </TranslationProvider>
    </AuthProvider>
  );
}

export default MyApp;
