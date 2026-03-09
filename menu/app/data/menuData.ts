export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: "Appetizer" | "Entrée" | "Dessert";
  audio_url?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Signature Wharf Sourdough Chowder",
    description: "Creamy New England style clam chowder served in a fresh-baked house-made sourdough bowl.",
    price: "$18.00",
    image: "/images/sourdough_chowder.png",
    category: "Appetizer",
    audio_url: "/audio/menu_74e0e89f30d9.mp3",
  },
  {
    id: "2",
    name: "Dungeness Crab Deviled Eggs",
    description: "With chives, local sea salt, and crispy sourdough crumbs.",
    price: "$21.00",
    image: "/images/crab_eggs.png",
    category: "Appetizer",
    audio_url: "/audio/menu_1926d512e4fb.mp3",
  },
  {
    id: "3",
    name: "The Wharf Cioppino",
    description: "A robust stew of Dungeness crab, shrimp, scallops, mussels, and seasonal fish in a spicy tomato-saffron broth. Served with sourdough crostini.",
    price: "$42.00",
    image: "/images/cioppino.png",
    category: "Entrée",
    audio_url: "/audio/menu_5a9d6cb73156.mp3",
  },
  {
    id: "4",
    name: "Anchor Steam Beer-Battered Fish & Chips",
    description: "Local rockfish, served with truffle-parmesan fries and seaweed-infused tartar sauce.",
    price: "$28.00",
    image: "/images/fish_chips.png",
    category: "Entrée",
    audio_url: "/audio/menu_233e84a3d4b5.mp3",
  },
  {
    id: "5",
    name: "Ghirardelli Sourdough Bread Pudding",
    description: "Warm chocolate bread pudding made with leftover house sourdough and 72% Ghirardelli dark chocolate.",
    price: "$14.00",
    image: "/images/bread_pudding.png",
    category: "Dessert",
    audio_url: "/audio/menu_48324e9f54b0.mp3",
  },
];
