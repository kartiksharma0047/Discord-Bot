import { REST, Routes } from "discord.js";
 
const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
];
 
const rest = new REST({ version: '10' }).setToken(process.env.Discord_Bot_Token);
 
try {
  console.log('Started refreshing application (/) commands.');
 
  await rest.put(Routes.applicationCommands(process.env.Discord_Client_ID), { body: commands });
 
  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
 