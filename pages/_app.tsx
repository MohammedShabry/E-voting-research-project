import { AppProps } from 'next/app'
import '@/styles/global.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useEffect, useState } from 'react'
import { checkWallet } from '@/services/blockchain'
import  AuthProvider  from '@/components/AuthProvider'
import { appWithTranslation } from "next-i18next";
import { UserConfig } from "next-i18next";
import nextI18NextConfig from "../next-i18next.config.js";

const emptyInitialI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  const [showChild, setShowChild] = useState<boolean>(false)
  
  useEffect(() => {
    checkWallet()
    setShowChild(true)
  }, [])
  return (
   
    <Provider store={store}>
          <AuthProvider>
      <Component {...pageProps} />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
  </AuthProvider>
      </Provider>  
    
  )
}

export default appWithTranslation(MyApp, emptyInitialI18NextConfig);
