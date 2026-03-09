import 'dotenv/config';
import { imagenTool } from '../src/tools/imagen-generator.js';

const menuItems = [
  { id: "1", name: "Signature Wharf Sourdough Chowder", prompt: "Creamy clam chowder in a sourdough bread bowl on a weathered pier table" },
  { id: "2", name: "Dungeness Crab Deviled Eggs", prompt: "Deviled eggs topped with fresh dungeness crab and chives on a white ceramic plate" },
  { id: "3", name: "The Wharf Cioppino", prompt: "Rich seafood stew with crab legs and mussels in a ceramic pot with crusty bread" },
  { id: "4", name: "Anchor Steam Beer-Battered Fish & Chips", prompt: "Crispy battered fish and thick cut fries with tartar sauce" },
  { id: "5", name: "Ghirardelli Sourdough Bread Pudding", prompt: "Chocolate bread pudding with a scoop of vanilla ice cream" }
];

async function generateAll() {
  console.log("--- Generating Photorealistic images for Menu Items (Imagen 4) ---");
  
  for (const item of menuItems) {
    console.log(`Processing: ${item.name}...`);
    const result = await (imagenTool as any).execute({
      dish_name: item.name,
      prompt: item.prompt
    });

    if (result.status === "success" || result.image_url) {
      console.log(`Result for ${item.name}: ${result.image_url}`);
    } else {
      console.error(`Failed for ${item.name}: ${result.message}`);
    }
  }
}

generateAll().catch(console.error);
