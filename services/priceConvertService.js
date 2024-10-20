import axios from "axios";

export const convertPrice = async (USDAmount) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const ethPriceInUSD = response.data.ethereum.usd;

    const ethAmount = USDAmount / ethPriceInUSD;

    return ethAmount.toFixed(18);
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    throw error;
  }
};
