import dotenv from "dotenv";

dotenv.config();

const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  MONGO_URI: process.env.MONGO_URI,
  CRYPTO_WALLET: process.env.CRYPTO_WALLET,
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  BASE_RPC_URL: "https://sepolia.base.org",
  WALLET_CONNECT_BRIDGE: "https://bridge.walletconnect.org",
  BOT_ADMIN_ID: process.env.BOT_ADMIN_ID,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
};

export default config;
