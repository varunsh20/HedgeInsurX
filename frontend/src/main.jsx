import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
//import './index.css'
import { ChakraProvider,extendTheme} from '@chakra-ui/react'
import { TabsProvider } from './context/TabsContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { Mumbai,Sepolia,BinanceTestnet,ArbitrumSepolia} from "@thirdweb-dev/chains";
import 'react-alice-carousel/lib/alice-carousel.css';

const theme = extendTheme({
  fonts: {
    heading: `'Ysabeau Office', sans-serif`,
    body: `'Ysabeau Office', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: '#101827', // Default background color
        color: 'white', // Default text color
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
      <ThirdwebProvider activeChain={Mumbai} supportedChains={[Mumbai,Sepolia,BinanceTestnet,ArbitrumSepolia]}>
      <TabsProvider>
      <App />
      </TabsProvider>
      </ThirdwebProvider>
      </BrowserRouter>
      </ChakraProvider>
  </React.StrictMode>,
)
