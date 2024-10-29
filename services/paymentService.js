import { SignClient as signClient2 } from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import Web3 from "web3";
import qrcode from "qrcode";
import * as config from "../config/config.js";
import { Community } from "../models/Community.js";
import { sendAnnouncmentInCommunityGroup } from "../controllers/privateGroupController.js";

let signClient;
let walletConnectModal;

const MANIFEST = {
  url: process.env.APP_URL || "https://your-app.com",
  name: "TON Payment Bot",
  iconUrl: `${process.env.APP_URL}/icon.png`,
};

class TonConnectStorage {
  constructor(chatId) {
    this.chatId = chatId;
    this.storage = new Map();
  }

  async setItem(key, value) {
    this.storage.set(`${this.chatId}:${key}`, value);
  }

  async getItem(key) {
    return this.storage.get(`${this.chatId}:${key}`);
  }

  async removeItem(key) {
    this.storage.delete(`${this.chatId}:${key}`);
  }
}

const createConnector = (chatId) => {
  return new TonConnect({
    manifestUrl: MANIFEST,
    storage: new TonConnectStorage(chatId),
  });
};

const initializeProvider = async () => {
  if (!signClient) {
    signClient = await signClient2.init({
      projectId: "8e6e7b5c80bed38af180c8a840ec5d09",
      relayUrl: "wss://relay.walletconnect.com",
      metadata: {
        name: "Telegram Payment Bot",
        description: "A bot to handle payments via WalletConnect",
        url: "https://localhost:3000",
        icons: ["https://localhost:3000/icon.png"],
      },
    });

    walletConnectModal = new WalletConnectModal({
      projectId: config.WALLETCONNECT_PROJECT_ID,
      standaloneChains: ["eip155:5545"],
    });
  }

  try {
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
          ],
          chains: ["eip155:5545"],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });

    if (uri) {
      const qrCodePath = await generateQRCode(uri);
      return { uri, qrCodePath, approval };
    }
  } catch (error) {
    console.error("Failed to initialize WalletConnect provider:", error);
    throw error;
  }
};

const generateQRCode = async (uri) => {
  const qrCodePath = "./qrcode.png";

  try {
    await qrcode.toFile(qrCodePath, uri);
    return qrCodePath;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw error;
  }
};

const extractEthereumAddress = (walletConnectAddress) => {
  const parts = walletConnectAddress.split(":");
  return parts[parts.length - 1];
};

const requestPayment = async (announcement, totalPrice, chatId, bot, user) => {
  try {
    const { uri, qrCodePath, approval } = await initializeProvider();

    await bot.sendPhoto(chatId, qrCodePath, {
      caption: "Scan this QR code to connect your wallet.",
    });
    console.log(uri);
    const deepLinkButton = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Connect Wallet",
              url: "https://tinyurl.com/connectWallet7289",
            },
          ],
        ],
      },
    };

    const session = await approval();
    console.log("Wallet connected:", session, session.namespaces.eip155);

    const fromAddress = extractEthereumAddress(
      session.namespaces.eip155.accounts[0]
    );

    bot.sendMessage(chatId, "Wallet connected! Approve the payment.");

    const valueInEth = totalPrice;
    const valueInWei = Web3.utils.toWei(valueInEth, "ether");

    const gasLimit = "0x5208"; // 21,000 gas in hex

    // Set lower maxFeePerGas and maxPriorityFeePerGas values to control the cost
    const maxFeePerGasGwei = "50"; // Max fee per gas unit (in Gwei)
    const maxFeePerGas = Web3.utils.toWei(maxFeePerGasGwei, "gwei");

    const maxPriorityFeePerGasGwei = "2"; // Priority fee per gas unit (in Gwei)
    const maxPriorityFeePerGas = Web3.utils.toWei(
      maxPriorityFeePerGasGwei,
      "gwei"
    );

    // Send the transaction with the adjusted values
    const result = await signClient.request({
      topic: session.topic,
      chainId: "eip155:5545",
      request: {
        method: "eth_sendTransaction",
        params: [
          {
            from: fromAddress,
            to: "0x3b8ae4e1Bf9BAe7E811A883Bdec4bE0F79E70242",
            data: "0x",
            maxFeePerGas: Web3.utils.toHex(maxFeePerGas),
            maxPriorityFeePerGas: Web3.utils.toHex(maxPriorityFeePerGas),
            gas: gasLimit,
            value: Web3.utils.toHex(valueInWei),
          },
        ],
      },
    });

    console.log(result);

    bot.sendMessage(
      chatId,
      `Payment request sent! Transaction hash: ${result}`
    );

    const web3 = new Web3("https://base-sepolia-rpc.publicnode.com"); // i will replace this with the actual rpc url

    async function checkTransactionStatus(txHash, chatId) {
      console.log("Checking transaction status for hash:", txHash);

      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const receipt = await web3.eth.getTransactionReceipt(txHash);

            if (receipt) {
              clearInterval(interval); // Stop the interval once the receipt is available
              if (receipt.status) {
                console.log("Transaction successful!");
                await bot.sendMessage(chatId, "Payment successful!");
                await bot.sendMessage(
                  chatId,
                  "We will verify your announcement, once verified we will notify you."
                );
                resolve(true); // Resolve the promise with true
              } else {
                console.error("Transaction failed!");
                await bot.sendMessage(
                  chatId,
                  "Payment failed. Please check the transaction details."
                );
                resolve(false); // Resolve the promise with false
              }
            } else {
              console.log(
                "Transaction not yet mined. Checking again in 2 seconds..."
              );
            }
          } catch (error) {
            console.error("Error checking transaction status:", error);
            clearInterval(interval);
            await bot.sendMessage(
              chatId,
              "Error checking payment status. Please verify manually."
            );
            reject(error);
          }
        }, 2000);
      });
    }

    try {
      const isSuccess = await checkTransactionStatus(result, chatId);

      if (isSuccess === true) {
        announcement.transactionHash = result;
        announcement.paymentConfirmation = "success";
        announcement.status = "validated";
        await announcement.save();

        sendAnnouncmentInCommunityGroup(bot, result);
      } else {
        announcement.transactionHash = result;
        announcement.paymentConfirmation = "pending";
        announcement.status = "pending";
        await announcement.save();
      }
    } catch (error) {
      console.error("Error in transaction status checking:", error);
    }
  } catch (error) {
    console.error("Payment failed: ", error);
    bot.sendMessage(chatId, "Payment failed. Please try again.");

    announcement.transactionHash = "null";
    announcement.paymentConfirmation = "pending";
    announcement.status = "pending";
    await announcement.save();
  }
};

const distributePayments = async (announcement) => {
  try {
    const session = await initializeProvider();
    const fromAddress = session.namespaces.eip155.accounts[0];
    const web3 = new Web3(new Web3.providers.HttpProvider(config.BASE_RPC_URL));

    const totalAmount = announcement.totalCost;
    const platformWallet = config.CRYPTO_WALLET;
    const platformShare = totalAmount * 0.2; // 20% to platform
    const communityShare =
      (totalAmount * 0.8) / announcement.communities.length;

    // Transfer 20% to the platform wallet
    await web3.eth.sendTransaction({
      from: fromAddress,
      to: platformWallet,
      value: web3.utils.toWei(platformShare.toString(), "ether"),
    });

    // Distribute 80% to community wallets
    for (const communityId of announcement.communities) {
      const community = await Community.findById(communityId);
      await web3.eth.sendTransaction({
        from: fromAddress,
        to: community.walletAddress,
        value: web3.utils.toWei(communityShare.toString(), "ether"),
      });
    }
  } catch (error) {
    console.error("Error distributing payments:", error);
    throw error;
  }
};
export { requestPayment, distributePayments };
