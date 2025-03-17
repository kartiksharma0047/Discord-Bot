import { Client, GatewayIntentBits } from "discord.js";
import { configDotenv } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Discord Bot is running!");
});

configDotenv(); // Load environment variables from .env

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.Google_Gemini_API_Key);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const generationConfig = {
  temperature: 2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Function to get AI response
async function getGeminiResponse(userMessage) {
  try {
    const chatSession = model.startChat({ generationConfig, history: [] });
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
    return "Sorry, I encountered an error processing your request.";
  }
}

// Function to send long messages in chunks
async function sendChunkedMessage(message, content) {
  const chunkSize = 2000; // Safe Discord limit
  for (let i = 0; i < content.length; i += chunkSize) {
    await message.reply(content.substring(i, i + chunkSize));
  }
}

// Event listener for messages
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  console.log(
    `Received message: "${message.content}" from ${message.author.username}`
  );

  const aiResponse = await getGeminiResponse(message.content);
  await sendChunkedMessage(message, aiResponse);
});

// Interaction commands (Example: /ping)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(process.env.Discord_Bot_Token);

app.listen(process.env.PORT,() => {
  console.log(`Server running on port : ${process.env.PORT}`);
});
