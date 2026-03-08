import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Character from './models/Character.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

const yugiDeck = {
  main: [
    {
      id: 46986414,
      name: "Dark Magician",
      type: "Normal Monster",
      desc: "The ultimate wizard in terms of attack and defense.",
      atk: 2500,
      def: 2100,
      level: 7,
      race: "Spellcaster",
      attribute: "DARK",
      image_url: "https://images.ygoprodeck.com/images/cards/46986414.jpg"
    },
    {
      id: 38033121,
      name: "Dark Magician Girl",
      type: "Effect Monster",
      desc: "Gains 300 ATK for every Dark Magician or Magician of Black Chaos in either player's Graveyard.",
      atk: 2000,
      def: 1700,
      level: 6,
      race: "Spellcaster",
      attribute: "DARK",
      image_url: "https://images.ygoprodeck.com/images/cards/38033121.jpg"
    }
  ],
  extra: []
}

const kaibaDeck = {
  main: [
    {
      id: 89631139,
      name: "Blue-Eyes White Dragon",
      type: "Normal Monster",
      desc: "This legendary dragon is a powerful engine of destruction.",
      atk: 3000,
      def: 2500,
      level: 8,
      race: "Dragon",
      attribute: "LIGHT",
      image_url: "https://images.ygoprodeck.com/images/cards/89631139.jpg"
    }
  ],
  extra: []
}

const joeyDeck = {
  main: [
    {
      id: 74677422,
      name: "Red-Eyes Black Dragon",
      type: "Normal Monster",
      desc: "A ferocious dragon with a deadly attack.",
      atk: 2400,
      def: 2000,
      level: 7,
      race: "Dragon",
      attribute: "DARK",
      image_url: "https://images.ygoprodeck.com/images/cards/74677422.jpg"
    }
  ],
  extra: []
}

const maiDeck = {
  main: [
    {
      id: 12206212,
      name: "Harpie Lady",
      type: "Effect Monster",
      desc: "This card's name becomes 'Harpie Lady' while on the field or in the GY.",
      atk: 1300,
      def: 1400,
      level: 4,
      race: "Winged Beast",
      attribute: "WIND",
      image_url: "https://images.ygoprodeck.com/images/cards/12206212.jpg"
    }
  ],
  extra: []
}

const pegasusDeck = {
  main: [
    {
      id: 10000000,
      name: "Relinquished",
      type: "Ritual Monster",
      desc: "You can Ritual Summon this card with 'Black Illusion Ritual'.",
      atk: 0,
      def: 0,
      level: 1,
      race: "Spellcaster",
      attribute: "DARK",
      image_url: "https://images.ygoprodeck.com/images/cards/64631466.jpg"
    }
  ],
  extra: []
}

const bakuraDeck = {
  main: [
    {
      id: 40737112,
      name: "Dark Necrofear",
      type: "Effect Monster",
      desc: "Cannot be Normal Summoned/Set. Must first be Special Summoned.",
      atk: 2200,
      def: 2800,
      level: 8,
      race: "Fiend",
      attribute: "DARK",
      image_url: "https://images.ygoprodeck.com/images/cards/40737112.jpg"
    }
  ],
  extra: []
}

const marikDeck = {
  main: [
    {
      id: 10000080,
      name: "The Winged Dragon of Ra",
      type: "Effect Monster",
      desc: "Cannot be Special Summoned.",
      atk: 0,
      def: 0,
      level: 10,
      race: "Divine-Beast",
      attribute: "DIVINE",
      image_url: "https://images.ygoprodeck.com/images/cards/10000080.jpg"
    }
  ],
  extra: []
}

const ishizuDeck = {
  main: [
    {
      id: 62279055,
      name: "Mystical Elf",
      type: "Normal Monster",
      desc: "A delicate elf that lacks offense, but has a terrific defense backed by mystical power.",
      atk: 800,
      def: 2000,
      level: 4,
      race: "Spellcaster",
      attribute: "LIGHT",
      image_url: "https://images.ygoprodeck.com/images/cards/62279055.jpg"
    }
  ],
  extra: []
}

const characters = [
  {
    name: "Yugi Muto",
    description: "The King of Games, master of the Dark Magician",
    avatar: "/image/yugimuto_pfp.webp",
    deck: yugiDeck
  },
  {
    name: "Kaiba",
    description: "CEO of Kaiba Corp, master of the Blue-Eyes White Dragon",
    avatar: "/image/yugimuto_pfp.webp",
    deck: kaibaDeck
  },
  {
    name: "Joey",
    description: "The underdog duelist with a heart of gold and Red-Eyes Black Dragon",
    avatar: "/image/yugimuto_pfp.webp",
    deck: joeyDeck
  },
  {
    name: "Mai",
    description: "The elegant duelist who commands the Harpie Ladies",
    avatar: "/image/yugimuto_pfp.webp",
    deck: maiDeck
  },
  {
    name: "Pegasus",
    description: "Creator of Duel Monsters and master of Toon cards",
    avatar: "/image/yugimuto_pfp.webp",
    deck: pegasusDeck
  },
  {
    name: "Yami Bakura",
    description: "The dark spirit wielding occult and fiend monsters",
    avatar: "/image/yugimuto_pfp.webp",
    deck: bakuraDeck
  },
  {
    name: "Yami Marik",
    description: "The evil alter ego commanding the Egyptian God Card Ra",
    avatar: "/image/yugimuto_pfp.webp",
    deck: marikDeck
  },
  {
    name: "Ishizu",
    description: "Guardian of the Millennium Necklace with mystical powers",
    avatar: "/image/yugimuto_pfp.webp",
    deck: ishizuDeck
  }
]

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yugioh_game'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Character.deleteMany({})
    console.log('🗑️  Cleared existing characters')

    // Insert new data
    await Character.insertMany(characters)
    console.log('✅ Seeded characters successfully')

    mongoose.connection.close()
    console.log('👋 Database connection closed')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
