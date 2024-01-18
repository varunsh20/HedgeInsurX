import { TrendingCoins } from "../../context/CoinApis";
import axios from "axios";
import "./tickers.css";
import { useEffect, useState } from "react";
import AliceCarousel from "react-alice-carousel";
import { Box,Text} from "@chakra-ui/react";

export default function Tickers(){
    const [trending, setTrending] = useState([]);

    const fetchTrendingCoins = async () => {
        const { data } = await axios.get(TrendingCoins());
        setTrending(data);
      };
    
    useEffect(() => {
        fetchTrendingCoins();
    }, []);
    
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const items = trending.map((coin) => {
      let profit = coin?.price_change_percentage_24h >= 0;
      return (
        <Box mt="150px" display="flex" flexDirection="column" alignItems="center" cursor="pointer" textTransform="uppercase"
          color="white">
          <Box as = "img" src={coin?.image} alt={coin.name} height="58" mb="10"/>
          <Text>
            {coin.symbol}{" "}
            <Text color={profit > 0 ? "rgb(14, 203, 129)" : "red"} fontWeight="500" display="inline">
              {profit && "+"}
              {coin?.price_change_percentage_24h?.toFixed(2)}%
            </Text>
          </Text>
          <Text fontSize="22" fontWeight="500">
            {coin?.symbol} ${numberWithCommas(coin?.current_price.toFixed(2))}
          </Text>
        </Box>
      );
    }
    );
    
    const responsive = {
      0: {
          items: 2,
      },
      512:{
          items: 5,
      },
    };
      
      return (
        <Box  top="500px" height="50%" display="flex" alignItems="center">
          <AliceCarousel mouseTracking infinite autoPlayInterval={1000} animationDuration={1500} disableDotsControls
            disableButtonsControls responsive={responsive} items={items} autoPlay/>
        </Box>
      );
}