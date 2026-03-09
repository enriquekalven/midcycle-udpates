import 'dotenv/config';
import { chirpTtsTool } from '../src/tools/tts-generator.js';
import fs from 'fs-extra';
import path from 'path';

const menuItems = [
  {
    id: "1",
    name: "Signature Wharf Sourdough Chowder",
    description: "Creamy New England style clam chowder served in a fresh-baked house-made sourdough bowl.",
    voice_style: "friendly_server"
  },
  {
    id: "2",
    name: "Dungeness Crab Deviled Eggs",
    description: "With chives, local sea salt, and crispy sourdough crumbs.",
    voice_style: "friendly_server"
  },
  {
    id: "3",
    name: "The Wharf Cioppino",
    description: "A robust stew of Dungeness crab, shrimp, scallops, mussels, and seasonal fish in a spicy tomato-saffron broth. Served with sourdough crostini.",
    voice_style: "enthusiastic_chef"
  },
  {
    id: "4",
    name: "Anchor Steam Beer-Battered Fish & Chips",
    description: "Local rockfish, served with truffle-parmesan fries and seaweed-infused tartar sauce.",
    voice_style: "enthusiastic_chef"
  },
  {
    id: "5",
    name: "Ghirardelli Sourdough Bread Pudding",
    description: "Warm chocolate bread pudding made with leftover house sourdough and 72% Ghirardelli dark chocolate.",
    voice_style: "friendly_server"
  }
];

async function generateAll() {
  console.log("--- Generating High-Quality Chirp 3 Audio for Menu Items ---");
  
  const results: any[] = [];

  for (const item of menuItems) {
    const text = `${item.name}. ${item.description}`;
    console.log(`Processing: ${item.name}...`);
    
    // Execute the tool directly
    const result = await (chirpTtsTool as any).execute({
      text: text,
      voice_style: item.voice_style
    });

    if (result.status === "success") {
      results.push({
        id: item.id,
        audio_url: result.audio_url
      });
      console.log(`Successfully generated: ${result.audio_url}`);
    } else {
      console.error(`Failed for ${item.name}: ${result.message}`);
    }
  }

  console.log("\n--- Update results for menuData.ts ---");
  console.log(JSON.stringify(results, null, 2));
}

generateAll().catch(console.error);
