"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Plus, Trash2, Play, RotateCcw, Check, X, Shuffle, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

// TOPICS WITH SUB-CATEGORIES
const TOPICS: Record<string, {
  icon: string;
  color: string;
  categories: Record<string, { question: string; answer: string; points: number }[]>;
}> = {
  "Islam": {
    icon: "☪️",
    color: "green",
    categories: {
      "Prophets": [
        { question: "This prophet is known as 'Khalilullah' (Friend of Allah)", answer: "Ibrahim (Abraham)", points: 100 },
        { question: "This prophet was swallowed by a whale", answer: "Yunus (Jonah)", points: 200 },
        { question: "This prophet was given the Zabur (Psalms)", answer: "Dawud (David)", points: 300 },
        { question: "This prophet could speak to animals and control jinn", answer: "Sulaiman (Solomon)", points: 400 },
        { question: "The prophet who was raised to the heavens without dying", answer: "Isa (Jesus)", points: 500 },
      ],
      "Pillars of Islam": [
        { question: "The first pillar of Islam - the declaration of faith", answer: "Shahada", points: 100 },
        { question: "The obligatory charity Muslims pay annually", answer: "Zakat", points: 200 },
        { question: "How many daily prayers are obligatory in Islam?", answer: "Five", points: 300 },
        { question: "The Islamic month of fasting", answer: "Ramadan", points: 400 },
        { question: "The pilgrimage every able Muslim must perform once", answer: "Hajj", points: 500 },
      ],
      "Quran": [
        { question: "The opening surah of the Quran", answer: "Al-Fatiha", points: 100 },
        { question: "The longest surah in the Quran", answer: "Al-Baqarah", points: 200 },
        { question: "The number of surahs in the Quran", answer: "114", points: 300 },
        { question: "This surah is known as 'The Heart of the Quran'", answer: "Surah Yasin", points: 400 },
        { question: "The last surah of the Quran", answer: "An-Nas", points: 500 },
      ],
      "Islamic History": [
        { question: "The year Prophet Muhammad migrated to Medina", answer: "622 CE (Hijra)", points: 100 },
        { question: "The first Muslim woman and wife of Prophet Muhammad", answer: "Khadijah", points: 200 },
        { question: "The first muezzin (caller to prayer) in Islam", answer: "Bilal ibn Rabah", points: 300 },
        { question: "The cave where Muhammad received the first revelation", answer: "Cave Hira", points: 400 },
        { question: "The treaty signed between Muslims and Quraysh in 628 CE", answer: "Treaty of Hudaybiyyah", points: 500 },
      ],
      "Islamic Practices": [
        { question: "The direction Muslims face during prayer", answer: "Qibla (toward Kaaba)", points: 100 },
        { question: "The night journey from Mecca to Jerusalem", answer: "Isra", points: 200 },
        { question: "The greeting Muslims say to each other", answer: "Assalamu Alaikum", points: 300 },
        { question: "The sermon delivered during Friday prayers", answer: "Khutbah", points: 400 },
        { question: "The voluntary night prayers during Ramadan", answer: "Taraweeh", points: 500 },
      ],
      "Mosques & Holy Sites": [
        { question: "The holiest mosque in Islam, located in Mecca", answer: "Masjid al-Haram", points: 100 },
        { question: "The mosque in Medina where Muhammad is buried", answer: "Masjid an-Nabawi", points: 200 },
        { question: "The mosque with the golden dome in Jerusalem", answer: "Dome of the Rock / Al-Aqsa", points: 300 },
        { question: "The cube-shaped building Muslims circle during Hajj", answer: "Kaaba", points: 400 },
        { question: "The well near the Kaaba that miraculously appeared for Hajar and Ismail", answer: "Zamzam", points: 500 },
      ],
    }
  },
  "Christianity": {
    icon: "✝️",
    color: "yellow",
    categories: {
      "Jesus Christ": [
        { question: "The town where Jesus was born", answer: "Bethlehem", points: 100 },
        { question: "Jesus performed his first miracle at a wedding here", answer: "Cana", points: 200 },
        { question: "The disciple who denied Jesus three times", answer: "Peter", points: 300 },
        { question: "The garden where Jesus prayed before his arrest", answer: "Gethsemane", points: 400 },
        { question: "Jesus said 'I am the way, the truth, and the ____'", answer: "Life", points: 500 },
      ],
      "The Bible": [
        { question: "The first book of the Bible", answer: "Genesis", points: 100 },
        { question: "The book containing the Ten Commandments", answer: "Exodus", points: 200 },
        { question: "How many books are in the Protestant Bible?", answer: "66", points: 300 },
        { question: "The book that contains the Beatitudes", answer: "Matthew", points: 400 },
        { question: "The last book of the Bible", answer: "Revelation", points: 500 },
      ],
      "Old Testament": [
        { question: "God created the world in this many days", answer: "Six (rested on seventh)", points: 100 },
        { question: "This man built an ark to survive the flood", answer: "Noah", points: 200 },
        { question: "The giant defeated by David with a sling", answer: "Goliath", points: 300 },
        { question: "The prophet taken to heaven in a chariot of fire", answer: "Elijah", points: 400 },
        { question: "This prophet spent three days in a great fish", answer: "Jonah", points: 500 },
      ],
      "New Testament": [
        { question: "The number of disciples Jesus had", answer: "Twelve", points: 100 },
        { question: "The apostle originally named Saul", answer: "Paul", points: 200 },
        { question: "This disciple doubted until he saw the wounds", answer: "Thomas", points: 300 },
        { question: "The city where disciples received the Holy Spirit", answer: "Jerusalem", points: 400 },
        { question: "The island where John wrote Revelation", answer: "Patmos", points: 500 },
      ],
      "Christian Holidays": [
        { question: "The holiday celebrating Jesus' birth", answer: "Christmas", points: 100 },
        { question: "The holiday celebrating Jesus' resurrection", answer: "Easter", points: 200 },
        { question: "The 40-day season of preparation before Easter", answer: "Lent", points: 300 },
        { question: "The day the Holy Spirit descended on the apostles", answer: "Pentecost", points: 400 },
        { question: "The day commemorating Jesus' entry into Jerusalem", answer: "Palm Sunday", points: 500 },
      ],
      "Churches & Saints": [
        { question: "The headquarters of the Catholic Church", answer: "Vatican City", points: 100 },
        { question: "The saint known for preaching to animals", answer: "St. Francis of Assisi", points: 200 },
        { question: "The mother of Jesus", answer: "Mary / Virgin Mary", points: 300 },
        { question: "The first Christian martyr", answer: "St. Stephen", points: 400 },
        { question: "The saint who was a tax collector before following Jesus", answer: "Matthew", points: 500 },
      ],
    }
  },
  "Pop Culture": {
    icon: "🎬",
    color: "pink",
    categories: {
      "Movies": [
        { question: "The movie where a young lion reclaims his kingdom", answer: "The Lion King", points: 100 },
        { question: "Leonardo DiCaprio finally won an Oscar for this film", answer: "The Revenant", points: 200 },
        { question: "This superhero snaps to save the universe in Endgame", answer: "Iron Man / Tony Stark", points: 300 },
        { question: "The 1994 film where Tom Hanks sits on a bench", answer: "Forrest Gump", points: 400 },
        { question: "Director of Inception, The Dark Knight, and Interstellar", answer: "Christopher Nolan", points: 500 },
      ],
      "TV Shows": [
        { question: "The show about a chemistry teacher turned drug lord", answer: "Breaking Bad", points: 100 },
        { question: "This Netflix show features Eleven and the Upside Down", answer: "Stranger Things", points: 200 },
        { question: "The sitcom about six friends in New York City", answer: "Friends", points: 300 },
        { question: "HBO fantasy series based on 'A Song of Ice and Fire'", answer: "Game of Thrones", points: 400 },
        { question: "Michael Scott is the boss in this mockumentary", answer: "The Office", points: 500 },
      ],
      "Music": [
        { question: "The 'King of Pop' who sang Thriller", answer: "Michael Jackson", points: 100 },
        { question: "This Canadian rapper 'started from the bottom'", answer: "Drake", points: 200 },
        { question: "British band: John, Paul, George, and Ringo", answer: "The Beatles", points: 300 },
        { question: "Known as 'Queen Bey', sang Single Ladies", answer: "Beyoncé", points: 400 },
        { question: "This rapper's real name is Marshall Mathers", answer: "Eminem", points: 500 },
      ],
      "Celebrities": [
        { question: "The actor who plays Iron Man in Marvel movies", answer: "Robert Downey Jr.", points: 100 },
        { question: "Kim, Khloé, Kourtney, Kendall, and Kylie's family name", answer: "Kardashian/Jenner", points: 200 },
        { question: "The billionaire who founded Tesla and SpaceX", answer: "Elon Musk", points: 300 },
        { question: "The actress who played Katniss in Hunger Games", answer: "Jennifer Lawrence", points: 400 },
        { question: "This actor played Jack in Titanic", answer: "Leonardo DiCaprio", points: 500 },
      ],
      "Disney": [
        { question: "The princess who lost her glass slipper", answer: "Cinderella", points: 100 },
        { question: "The name of the snowman in Frozen", answer: "Olaf", points: 200 },
        { question: "The genie in Aladdin was voiced by this comedian", answer: "Robin Williams", points: 300 },
        { question: "The villain in The Little Mermaid", answer: "Ursula", points: 400 },
        { question: "The first Pixar movie ever made", answer: "Toy Story", points: 500 },
      ],
      "Internet & Memes": [
        { question: "The video platform owned by Google", answer: "YouTube", points: 100 },
        { question: "The short video app known for dances and trends", answer: "TikTok", points: 200 },
        { question: "The meme of a woman yelling at this animal", answer: "Cat", points: 300 },
        { question: "This singer is associated with Rickrolling", answer: "Rick Astley", points: 400 },
        { question: "The cryptocurrency with a dog mascot", answer: "Dogecoin", points: 500 },
      ],
    }
  },
  "Sports": {
    icon: "⚽",
    color: "orange",
    categories: {
      "Soccer/Football": [
        { question: "This player is known as CR7", answer: "Cristiano Ronaldo", points: 100 },
        { question: "The country that has won the most World Cups", answer: "Brazil", points: 200 },
        { question: "The famous Barcelona and Argentina player, #10", answer: "Lionel Messi", points: 300 },
        { question: "The club known as 'The Red Devils' in England", answer: "Manchester United", points: 400 },
        { question: "The country that hosted the 2022 World Cup", answer: "Qatar", points: 500 },
      ],
      "Basketball": [
        { question: "Players on a basketball team on the court", answer: "Five", points: 100 },
        { question: "This player is nicknamed 'The King'", answer: "LeBron James", points: 200 },
        { question: "The team Michael Jordan won 6 championships with", answer: "Chicago Bulls", points: 300 },
        { question: "The player known as 'The Black Mamba'", answer: "Kobe Bryant", points: 400 },
        { question: "The player who holds the all-time scoring record", answer: "LeBron James", points: 500 },
      ],
      "American Football": [
        { question: "The championship game of the NFL", answer: "Super Bowl", points: 100 },
        { question: "This quarterback has won 7 Super Bowls", answer: "Tom Brady", points: 200 },
        { question: "The team known as 'America's Team'", answer: "Dallas Cowboys", points: 300 },
        { question: "Points scored for a touchdown", answer: "Six", points: 400 },
        { question: "The only team to go undefeated and win the Super Bowl", answer: "1972 Miami Dolphins", points: 500 },
      ],
      "Olympics": [
        { question: "The number of rings in the Olympic logo", answer: "Five", points: 100 },
        { question: "The country that hosted the 2020 (2021) Olympics", answer: "Japan", points: 200 },
        { question: "The swimmer with the most Olympic gold medals", answer: "Michael Phelps", points: 300 },
        { question: "The fastest man alive, from Jamaica", answer: "Usain Bolt", points: 400 },
        { question: "The city hosting the 2028 Summer Olympics", answer: "Los Angeles", points: 500 },
      ],
      "Tennis": [
        { question: "A score of zero in tennis", answer: "Love", points: 100 },
        { question: "The tournament played on grass at Wimbledon", answer: "Wimbledon Championships", points: 200 },
        { question: "Sisters who dominated women's tennis", answer: "Venus and Serena Williams", points: 300 },
        { question: "The Spanish player known as 'King of Clay'", answer: "Rafael Nadal", points: 400 },
        { question: "Winning all four Grand Slams in one year", answer: "Calendar Grand Slam", points: 500 },
      ],
      "Combat Sports": [
        { question: "The martial art from Brazil using grappling", answer: "Brazilian Jiu-Jitsu", points: 100 },
        { question: "'The Greatest' boxer of all time", answer: "Muhammad Ali", points: 200 },
        { question: "The Irish UFC fighter known for his trash talk", answer: "Conor McGregor", points: 300 },
        { question: "The country where sumo wrestling originated", answer: "Japan", points: 400 },
        { question: "The boxer known as 'Iron Mike'", answer: "Mike Tyson", points: 500 },
      ],
    }
  },
  "Science & Nature": {
    icon: "🔬",
    color: "cyan",
    categories: {
      "Space": [
        { question: "The planet known as the Red Planet", answer: "Mars", points: 100 },
        { question: "The first man to walk on the moon", answer: "Neil Armstrong", points: 200 },
        { question: "The largest planet in our solar system", answer: "Jupiter", points: 300 },
        { question: "The galaxy we live in", answer: "Milky Way", points: 400 },
        { question: "The force that keeps planets in orbit", answer: "Gravity", points: 500 },
      ],
      "Animals": [
        { question: "The largest mammal on Earth", answer: "Blue Whale", points: 100 },
        { question: "The only mammal that can truly fly", answer: "Bat", points: 200 },
        { question: "A group of lions is called this", answer: "A Pride", points: 300 },
        { question: "The fastest land animal", answer: "Cheetah", points: 400 },
        { question: "The animal that sleeps standing up", answer: "Horse", points: 500 },
      ],
      "Human Body": [
        { question: "The number of bones in an adult human body", answer: "206", points: 100 },
        { question: "The largest organ in the human body", answer: "Skin", points: 200 },
        { question: "The body part that pumps blood", answer: "Heart", points: 300 },
        { question: "The type of blood cells that fight infection", answer: "White blood cells", points: 400 },
        { question: "The part of the brain that controls balance", answer: "Cerebellum", points: 500 },
      ],
      "Chemistry": [
        { question: "H2O is the formula for this", answer: "Water", points: 100 },
        { question: "The gas we breathe in to survive", answer: "Oxygen", points: 200 },
        { question: "The table that organizes all elements", answer: "Periodic Table", points: 300 },
        { question: "The element with symbol Au", answer: "Gold", points: 400 },
        { question: "The pH level of a neutral substance", answer: "7", points: 500 },
      ],
      "Geography": [
        { question: "The largest ocean on Earth", answer: "Pacific Ocean", points: 100 },
        { question: "The country shaped like a boot", answer: "Italy", points: 200 },
        { question: "The longest river in Africa", answer: "The Nile", points: 300 },
        { question: "The only continent that is also a country", answer: "Australia", points: 400 },
        { question: "The smallest country in the world", answer: "Vatican City", points: 500 },
      ],
      "Weather": [
        { question: "The scale used to measure hurricanes", answer: "Saffir-Simpson", points: 100 },
        { question: "Frozen rain that falls as ice pellets", answer: "Hail", points: 200 },
        { question: "The rotating column of air in a storm", answer: "Tornado", points: 300 },
        { question: "The layer of atmosphere where weather occurs", answer: "Troposphere", points: 400 },
        { question: "The term for the average weather over time", answer: "Climate", points: 500 },
      ],
    }
  },
  "Food & Lifestyle": {
    icon: "🍕",
    color: "purple",
    categories: {
      "World Cuisine": [
        { question: "The Italian dish of flat dough with toppings", answer: "Pizza", points: 100 },
        { question: "This Japanese dish features raw fish on rice", answer: "Sushi", points: 200 },
        { question: "The main ingredient in guacamole", answer: "Avocado", points: 300 },
        { question: "The French pastry that is crescent-shaped", answer: "Croissant", points: 400 },
        { question: "The expensive spice from the crocus flower", answer: "Saffron", points: 500 },
      ],
      "Drinks": [
        { question: "The most consumed beverage in the world after water", answer: "Tea", points: 100 },
        { question: "The Italian coffee drink with espresso and steamed milk", answer: "Latte/Cappuccino", points: 200 },
        { question: "The country famous for tequila", answer: "Mexico", points: 300 },
        { question: "The French wine region known for sparkling wine", answer: "Champagne", points: 400 },
        { question: "The Scottish whisky spelled without an 'e'", answer: "Scotch/Whisky", points: 500 },
      ],
      "Fashion": [
        { question: "The athletic brand with 'Just Do It'", answer: "Nike", points: 100 },
        { question: "The luxury brand with interlocking G logo", answer: "Gucci", points: 200 },
        { question: "The designer with iconic red-soled heels", answer: "Christian Louboutin", points: 300 },
        { question: "The French brand with interlocking L and V", answer: "Louis Vuitton", points: 400 },
        { question: "The fashion capital of Italy", answer: "Milan", points: 500 },
      ],
      "Cars": [
        { question: "The Italian car brand with a prancing horse", answer: "Ferrari", points: 100 },
        { question: "The electric car company by Elon Musk", answer: "Tesla", points: 200 },
        { question: "The country where Toyota and Honda are from", answer: "Japan", points: 300 },
        { question: "The famous car from Back to the Future", answer: "DeLorean", points: 400 },
        { question: "The German brand meaning 'people's car'", answer: "Volkswagen", points: 500 },
      ],
      "Holidays": [
        { question: "The holiday on October 31st with costumes", answer: "Halloween", points: 100 },
        { question: "American independence is celebrated on this date", answer: "July 4th", points: 200 },
        { question: "The Jewish festival of lights lasting 8 days", answer: "Hanukkah", points: 300 },
        { question: "The Hindu festival of colors in spring", answer: "Holi", points: 400 },
        { question: "The Chinese New Year animal for 2024", answer: "Dragon", points: 500 },
      ],
      "Travel": [
        { question: "The city with the Eiffel Tower", answer: "Paris", points: 100 },
        { question: "The wonder of the world in India", answer: "Taj Mahal", points: 200 },
        { question: "The famous clock tower in London", answer: "Big Ben", points: 300 },
        { question: "The country with the Great Barrier Reef", answer: "Australia", points: 400 },
        { question: "The ancient Inca city in Peru", answer: "Machu Picchu", points: 500 },
      ],
    }
  },
  "Gaming & Tech": {
    icon: "🎮",
    color: "cyan",
    categories: {
      "Video Games": [
        { question: "The plumber who saves Princess Peach", answer: "Mario", points: 100 },
        { question: "The battle royale game where you build and shoot", answer: "Fortnite", points: 200 },
        { question: "The blocky sandbox game where you mine and craft", answer: "Minecraft", points: 300 },
        { question: "The hedgehog known for his speed", answer: "Sonic", points: 400 },
        { question: "This game series features Master Chief", answer: "Halo", points: 500 },
      ],
      "Technology": [
        { question: "The company that makes the iPhone", answer: "Apple", points: 100 },
        { question: "The social media platform bought by Elon Musk", answer: "Twitter/X", points: 200 },
        { question: "The AI chatbot made by OpenAI", answer: "ChatGPT", points: 300 },
        { question: "The founder of Microsoft", answer: "Bill Gates", points: 400 },
        { question: "The programming language named after coffee", answer: "Java", points: 500 },
      ],
      "Consoles": [
        { question: "Nintendo's hybrid home/portable console", answer: "Nintendo Switch", points: 100 },
        { question: "Sony's latest PlayStation console number", answer: "PlayStation 5", points: 200 },
        { question: "Microsoft's gaming console brand", answer: "Xbox", points: 300 },
        { question: "The handheld that played Pokémon Red and Blue", answer: "Game Boy", points: 400 },
        { question: "The first commercially successful video game console", answer: "Atari 2600", points: 500 },
      ],
      "Social Media": [
        { question: "The photo-sharing app with stories and reels", answer: "Instagram", points: 100 },
        { question: "The platform for professional networking", answer: "LinkedIn", points: 200 },
        { question: "The app where messages disappear", answer: "Snapchat", points: 300 },
        { question: "The platform that replaced Vine for short videos", answer: "TikTok", points: 400 },
        { question: "The year Facebook was founded", answer: "2004", points: 500 },
      ],
      "Esports": [
        { question: "The game where you plant or defuse bombs", answer: "Counter-Strike", points: 100 },
        { question: "The MOBA game with champions and lanes", answer: "League of Legends", points: 200 },
        { question: "The game where you're a legend in an arena", answer: "Apex Legends", points: 300 },
        { question: "The FIFA esports league organization", answer: "eWorld Cup", points: 400 },
        { question: "The biggest Dota 2 tournament", answer: "The International", points: 500 },
      ],
      "Gadgets": [
        { question: "The wearable device that tracks fitness", answer: "Smartwatch/Fitbit", points: 100 },
        { question: "The wireless earbuds made by Apple", answer: "AirPods", points: 200 },
        { question: "The VR headset by Meta", answer: "Quest/Oculus", points: 300 },
        { question: "The flying camera device", answer: "Drone", points: 400 },
        { question: "The Tesla humanoid robot", answer: "Optimus", points: 500 },
      ],
    }
  },
  "History & World": {
    icon: "🏛️",
    color: "yellow",
    categories: {
      "World History": [
        { question: "The ship that sank in 1912", answer: "Titanic", points: 100 },
        { question: "The ancient wonder located in Egypt", answer: "Pyramids of Giza", points: 200 },
        { question: "The year World War II ended", answer: "1945", points: 300 },
        { question: "The wall that divided Berlin until 1989", answer: "Berlin Wall", points: 400 },
        { question: "The queen who ruled England for 63 years until 1901", answer: "Queen Victoria", points: 500 },
      ],
      "World Capitals": [
        { question: "The capital of France", answer: "Paris", points: 100 },
        { question: "The capital of Japan", answer: "Tokyo", points: 200 },
        { question: "The capital of Australia (not Sydney!)", answer: "Canberra", points: 300 },
        { question: "The capital of Brazil", answer: "Brasília", points: 400 },
        { question: "The capital of Turkey", answer: "Ankara", points: 500 },
      ],
      "Famous Leaders": [
        { question: "The first President of the United States", answer: "George Washington", points: 100 },
        { question: "The British Prime Minister during WWII", answer: "Winston Churchill", points: 200 },
        { question: "The civil rights leader who said 'I have a dream'", answer: "Martin Luther King Jr.", points: 300 },
        { question: "The Indian leader known for nonviolent resistance", answer: "Mahatma Gandhi", points: 400 },
        { question: "The South African president who ended apartheid", answer: "Nelson Mandela", points: 500 },
      ],
      "Ancient Civilizations": [
        { question: "The civilization that built the Colosseum", answer: "Romans", points: 100 },
        { question: "The Egyptian writing system with pictures", answer: "Hieroglyphics", points: 200 },
        { question: "The Greek city famous for warriors", answer: "Sparta", points: 300 },
        { question: "The Aztec capital, now Mexico City", answer: "Tenochtitlan", points: 400 },
        { question: "The ancient trade route between China and Europe", answer: "Silk Road", points: 500 },
      ],
      "Flags & Countries": [
        { question: "The only country with a square flag", answer: "Switzerland/Vatican", points: 100 },
        { question: "The country with maple leaf on its flag", answer: "Canada", points: 200 },
        { question: "The continent with the most countries", answer: "Africa", points: 300 },
        { question: "The largest country by area", answer: "Russia", points: 400 },
        { question: "The country that was never colonized in Africa", answer: "Ethiopia", points: 500 },
      ],
      "Languages": [
        { question: "The most spoken language in the world", answer: "English/Mandarin Chinese", points: 100 },
        { question: "The language spoken in Brazil", answer: "Portuguese", points: 200 },
        { question: "The country with the most official languages (11)", answer: "South Africa", points: 300 },
        { question: "The ancient language of the Roman Empire", answer: "Latin", points: 400 },
        { question: "The constructed language created in 1887", answer: "Esperanto", points: 500 },
      ],
    }
  },
};

const TEAM_COLORS = [
  { name: "Pink", bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-400", glow: "neon-box-pink", light: "bg-pink-900/30" },
  { name: "Cyan", bg: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-400", glow: "neon-box-cyan", light: "bg-cyan-900/30" },
  { name: "Green", bg: "bg-green-500", border: "border-green-500", text: "text-green-400", glow: "neon-box-green", light: "bg-green-900/30" },
  { name: "Yellow", bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-400", glow: "neon-box-yellow", light: "bg-yellow-900/30" },
  { name: "Orange", bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-400", glow: "neon-box-orange", light: "bg-orange-900/30" },
  { name: "Purple", bg: "bg-purple-500", border: "border-purple-500", text: "text-purple-400", glow: "neon-box-purple", light: "bg-purple-900/30" },
];

const COLOR_CLASSES: Record<string, { box: string; text: string; bg: string; border: string }> = {
  green: { box: "neon-box-green", text: "text-green-400", bg: "bg-green-900/30", border: "border-green-500" },
  yellow: { box: "neon-box-yellow", text: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-500" },
  pink: { box: "neon-box-pink", text: "text-pink-400", bg: "bg-pink-900/30", border: "border-pink-500" },
  orange: { box: "neon-box-orange", text: "text-orange-400", bg: "bg-orange-900/30", border: "border-orange-500" },
  cyan: { box: "neon-box-cyan", text: "text-cyan-400", bg: "bg-cyan-900/30", border: "border-cyan-500" },
  purple: { box: "neon-box-purple", text: "text-purple-400", bg: "bg-purple-900/30", border: "border-purple-500" },
};

interface Team {
  id: string;
  name: string;
  color: typeof TEAM_COLORS[0];
  score: number;
}

interface Question {
  question: string;
  answer: string;
  points: number;
}

type GamePhase = "setup" | "topicSelect" | "categorySelect" | "playing" | "question" | "answer" | "gameOver";

interface CustomCategory {
  name: string;
  questions: Question[];
  topic: string;
  createdAt: string;
}

export default function JeopardyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [numCategories, setNumCategories] = useState(5);
  
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [selectedQuestion, setSelectedQuestion] = useState<{ category: string; question: Question } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzedTeam, setBuzzedTeam] = useState<Team | null>(null);
  
  // Custom category states
  const [customCategories, setCustomCategories] = useState<Record<string, CustomCategory[]>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryQuestions, setNewCategoryQuestions] = useState<Question[]>([
    { question: "", answer: "", points: 100 },
    { question: "", answer: "", points: 200 },
    { question: "", answer: "", points: 300 },
    { question: "", answer: "", points: 400 },
    { question: "", answer: "", points: 500 },
  ]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
    
    // Load custom categories from localStorage
    const savedCustomCategories = localStorage.getItem("jeopardy_custom_categories");
    if (savedCustomCategories) {
      setCustomCategories(JSON.parse(savedCustomCategories));
    }
  }, [router]);

  // Separate effect to initialize team from group
  useEffect(() => {
    if (!currentUser) return;
    
    // Check if there's a current group and auto-populate team
    const currentGroup = localStorage.getItem("currentGroup");
    if (currentGroup && teams.length === 0) {
      try {
        const group = JSON.parse(currentGroup);
        const availableColor = TEAM_COLORS[0];
        
        // Create a team from the group
        const groupTeam: Team = {
          id: `group_${group.id}`,
          name: group.name,
          color: availableColor,
          score: 0
        };
        setTeams([groupTeam]);
      } catch (e) {
        console.error("Error loading group:", e);
      }
    }
  }, [currentUser, teams.length]);

  const topicNames = Object.keys(TOPICS);
  const currentTopicData = selectedTopic ? TOPICS[selectedTopic] : null;
  
  // Merge regular categories with custom categories for the selected topic
  const getAvailableCategories = () => {
    if (!selectedTopic) return [];
    const regularCategories = currentTopicData ? Object.keys(currentTopicData.categories) : [];
    const customCats = customCategories[selectedTopic] || [];
    const customCategoryNames = customCats.map(cat => cat.name);
    return [...regularCategories, ...customCategoryNames];
  };
  
  const availableCategories = getAvailableCategories();
  
  // Get category data (from TOPICS or custom)
  const getCategoryData = (categoryName: string) => {
    if (!selectedTopic) return null;
    
    // Check if it's a custom category
    const customCats = customCategories[selectedTopic] || [];
    const customCat = customCats.find(cat => cat.name === categoryName);
    if (customCat) {
      return customCat.questions;
    }
    
    // Otherwise get from TOPICS
    if (currentTopicData && currentTopicData.categories[categoryName]) {
      return currentTopicData.categories[categoryName];
    }
    
    return null;
  };

  const addTeam = () => {
    if (teams.length >= 6) return;
    const usedColors = teams.map(t => t.color.name);
    const availableColor = TEAM_COLORS.find(c => !usedColors.includes(c.name)) || TEAM_COLORS[0];
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: `Team ${teams.length + 1}`,
      color: availableColor,
      score: 0
    };
    setTeams([...teams, newTeam]);
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name } : t));
  };

  const updateTeamColor = (id: string, color: typeof TEAM_COLORS[0]) => {
    setTeams(teams.map(t => t.id === id ? { ...t, color } : t));
  };

  const startGame = () => {
    if (teams.length < 2) return;
    setPhase("topicSelect");
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedCategories([]);
    setShowAddCategory(false);
    setNewCategoryName("");
    setNewCategoryQuestions([
      { question: "", answer: "", points: 100 },
      { question: "", answer: "", points: 200 },
      { question: "", answer: "", points: 300 },
      { question: "", answer: "", points: 400 },
      { question: "", answer: "", points: 500 },
    ]);
    setPhase("categorySelect");
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < numCategories) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const randomizeCategories = () => {
    const shuffled = [...availableCategories].sort(() => Math.random() - 0.5);
    setSelectedCategories(shuffled.slice(0, Math.min(numCategories, shuffled.length)));
  };

  const selectAllCategories = () => {
    const maxCats = Math.min(numCategories, availableCategories.length);
    setSelectedCategories(availableCategories.slice(0, maxCats));
  };

  const startPlaying = () => {
    if (selectedCategories.length < 1) return;
    setPhase("playing");
    setUsedQuestions(new Set());
  };

  const selectQuestion = (category: string, questionIndex: number) => {
    if (!selectedTopic) return;
    const questions = getCategoryData(category);
    if (!questions || !questions[questionIndex]) return;
    
    const questionKey = `${category}-${questionIndex}`;
    if (usedQuestions.has(questionKey)) return;
    
    setSelectedQuestion({ category, question: questions[questionIndex] });
    setPhase("question");
    setShowAnswer(false);
    setBuzzedTeam(null);
  };
  
  const saveCustomCategory = () => {
    if (!selectedTopic || !newCategoryName.trim()) return;
    
    // Validate all questions are filled
    const validQuestions = newCategoryQuestions.filter(q => q.question.trim() && q.answer.trim());
    if (validQuestions.length < 5) {
      alert("Please fill in all 5 questions and answers!");
      return;
    }
    
    const categoryName = newCategoryName.trim();
    
    // Check if category name already exists
    const existingCategories = getAvailableCategories();
    if (existingCategories.includes(categoryName)) {
      alert("A category with this name already exists!");
      return;
    }
    
    const newCategory: CustomCategory = {
      name: categoryName,
      questions: validQuestions,
      topic: selectedTopic,
      createdAt: new Date().toISOString(),
    };
    
    // Add to custom categories
    const updatedCustomCategories = {
      ...customCategories,
      [selectedTopic]: [...(customCategories[selectedTopic] || []), newCategory],
    };
    
    setCustomCategories(updatedCustomCategories);
    
    // Save to localStorage
    localStorage.setItem("jeopardy_custom_categories", JSON.stringify(updatedCustomCategories));
    
    // Auto-select the new category if there's room
    if (selectedCategories.length < numCategories) {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
    
    // Reset form
    setNewCategoryName("");
    setNewCategoryQuestions([
      { question: "", answer: "", points: 100 },
      { question: "", answer: "", points: 200 },
      { question: "", answer: "", points: 300 },
      { question: "", answer: "", points: 400 },
      { question: "", answer: "", points: 500 },
    ]);
    setShowAddCategory(false);
  };
  
  const updateNewQuestion = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...newCategoryQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setNewCategoryQuestions(updated);
  };

  const handleBuzz = (team: Team) => {
    if (buzzedTeam) return;
    setBuzzedTeam(team);
  };

  const revealAnswer = () => {
    setShowAnswer(true);
    setPhase("answer");
  };

  const handleCorrect = () => {
    if (!selectedQuestion || !buzzedTeam) return;
    
    setTeams(teams.map(t => 
      t.id === buzzedTeam.id 
        ? { ...t, score: t.score + selectedQuestion.question.points }
        : t
    ));
    
    finishQuestion();
  };

  const handleIncorrect = () => {
    if (!selectedQuestion || !buzzedTeam) return;
    
    setTeams(teams.map(t => 
      t.id === buzzedTeam.id 
        ? { ...t, score: Math.max(0, t.score - selectedQuestion.question.points) }
        : t
    ));
    
    setBuzzedTeam(null);
    setShowAnswer(false);
    setPhase("question");
  };

  const handleNoAnswer = () => {
    setShowAnswer(true);
    setPhase("answer");
  };

  const finishQuestion = () => {
    if (!selectedQuestion || !selectedTopic) return;
    
    const questions = getCategoryData(selectedQuestion.category);
    if (!questions) return;
    
    const questionIndex = questions.findIndex(q => q.question === selectedQuestion.question.question);
    const questionKey = `${selectedQuestion.category}-${questionIndex}`;
    
    const newUsedQuestions = new Set([...usedQuestions, questionKey]);
    setUsedQuestions(newUsedQuestions);
    
    // Check if all questions are used
    const totalQuestions = selectedCategories.length * 5;
    if (newUsedQuestions.size >= totalQuestions) {
      setPhase("gameOver");
    } else {
      setSelectedQuestion(null);
      setShowAnswer(false);
      setBuzzedTeam(null);
      setCurrentTeamIndex((currentTeamIndex + 1) % teams.length);
      setPhase("playing");
    }
  };

  const continueFromAnswer = () => {
    finishQuestion();
  };

  const resetGame = () => {
    setPhase("setup");
    setTeams([]);
    setCurrentTeamIndex(0);
    setSelectedTopic(null);
    setSelectedCategories([]);
    setUsedQuestions(new Set());
    setSelectedQuestion(null);
    setShowAnswer(false);
    setBuzzedTeam(null);
  };

  const playAgain = () => {
    setPhase("topicSelect");
    setCurrentTeamIndex(0);
    setSelectedTopic(null);
    setSelectedCategories([]);
    setUsedQuestions(new Set());
    setSelectedQuestion(null);
    setShowAnswer(false);
    setBuzzedTeam(null);
    setTeams(teams.map(t => ({ ...t, score: 0 })));
  };

  const changeTopic = () => {
    setPhase("topicSelect");
    setSelectedTopic(null);
    setSelectedCategories([]);
    setShowAddCategory(false);
    setNewCategoryName("");
    setNewCategoryQuestions([
      { question: "", answer: "", points: 100 },
      { question: "", answer: "", points: 200 },
      { question: "", answer: "", points: 300 },
      { question: "", answer: "", points: 400 },
      { question: "", answer: "", points: 500 },
    ]);
  };

  if (!currentUser) return null;

  const currentTeam = teams[currentTeamIndex];
  const topicColor = currentTopicData ? COLOR_CLASSES[currentTopicData.color] : COLOR_CLASSES.cyan;

  // SETUP PHASE
  if (phase === "setup") {
    const currentGroup = localStorage.getItem("currentGroup");
    let groupInfo = null;
    if (currentGroup) {
      try {
        groupInfo = JSON.parse(currentGroup);
      } catch (e) {
        // Ignore parse errors
      }
    }

    return (
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-semibold animate-fade-in-left hover:animate-pulse-glow"
          >
            <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
            BACK TO GAMES
          </Link>

          <div className="text-center mb-8 animate-fade-in-down delay-200">
            <h1 className="pixel-font text-3xl md:text-5xl font-bold text-yellow-400 neon-glow-yellow mb-4 float-3d text-3d animate-glow-pulse">
              🎯 JEOPARDY! 🎯
            </h1>
            <p className="text-cyan-300 animate-fade-in-up delay-300">
              The Ultimate Trivia Showdown!
            </p>
          </div>

          {/* Group Info Banner */}
          {groupInfo && (
            <div className="neon-card neon-box-purple p-4 mb-6 card-3d animate-slide-fade-in delay-400">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 animate-fade-in-left">
                  <Users className="w-5 h-5 text-purple-400 animate-pulse" />
                  <div>
                    <div className="text-purple-400 font-bold">Playing with Group: {groupInfo.name}</div>
                    <div className="text-cyan-300/70 text-sm">
                      {groupInfo.members.length + 1} member{groupInfo.members.length !== 0 ? "s" : ""} as one team
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="neon-card neon-box-yellow p-8 card-3d animate-scale-in delay-400">
            <h2 className="pixel-font text-xl text-cyan-400 neon-glow-cyan mb-6 text-center animate-fade-in-up">
              🏆 CREATE YOUR TEAMS
            </h2>

            {/* Teams List */}
            <div className="space-y-4 mb-6">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`${team.color.light} rounded-xl p-4 border-2 ${team.color.border} ${team.color.glow} flex items-center gap-4 transition-all score-card-3d card-enter hover:animate-pulse-glow`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-full ${team.color.bg} flex items-center justify-center text-black font-bold text-lg animate-bounce-in`} style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white font-semibold focus:outline-none focus:border-cyan-400 input-3d focus:animate-pulse-glow"
                    maxLength={20}
                  />
                  <div className="flex gap-1">
                    {TEAM_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => updateTeamColor(team.id, color)}
                        className={`w-6 h-6 rounded-full ${color.bg} ${
                          team.color.name === color.name ? "ring-2 ring-white scale-110 animate-pulse" : "opacity-50 hover:opacity-100"
                        } transition-all hover:animate-scale-up`}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-lg transition-colors hover:animate-shake"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {teams.length < 6 && (
              <button
                onClick={addTeam}
                className="w-full py-4 border-2 border-dashed border-cyan-500/50 rounded-xl text-cyan-400 font-bold hover:bg-cyan-900/20 transition-colors flex items-center justify-center gap-2 animate-fade-in-up delay-500 hover:animate-pulse-glow"
              >
                <Plus className="w-6 h-6 animate-rotate-in" />
                ADD TEAM
              </button>
            )}

            {/* Start Button */}
            <button
              onClick={startGame}
              disabled={teams.length < 2}
              className={`w-full mt-8 py-5 rounded-xl text-xl font-bold transition-all flex items-center justify-center gap-3 ${
                teams.length >= 2
                  ? "neon-btn neon-btn-green btn-3d hover:animate-button-press"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
              } animate-fade-in-up delay-600`}
            >
              <Play className="w-6 h-6 animate-pulse" />
              {teams.length < 2 ? "ADD AT LEAST 2 TEAMS" : "CHOOSE TOPIC →"}
            </button>

            {/* How to Play */}
            <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border-2 border-blue-500/50">
              <h3 className="font-bold text-blue-400 mb-3">📖 HOW TO PLAY</h3>
              <ul className="text-blue-300/80 space-y-2 text-sm">
                <li>• Choose a <span className="text-yellow-400">TOPIC</span> (Islam, Christianity, Sports, etc.)</li>
                <li>• Pick <span className="text-pink-400">categories</span> within that topic</li>
                <li>• Teams take turns selecting questions from the board</li>
                <li>• Any team can <span className="text-green-400">BUZZ IN</span> to answer!</li>
                <li>• Correct = +points, Wrong = -points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TOPIC SELECTION PHASE
  if (phase === "topicSelect") {
    return (
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setPhase("setup")}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-semibold animate-fade-in-left hover:animate-pulse-glow"
          >
            <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
            BACK TO TEAMS
          </button>

          <div className="text-center mb-8 animate-fade-in-down delay-200">
            <h1 className="pixel-font text-2xl md:text-4xl font-bold text-yellow-400 neon-glow-yellow mb-2 animate-glow-pulse">
              CHOOSE YOUR TOPIC
            </h1>
            <p className="text-cyan-300 animate-fade-in-up delay-300">
              Each topic has its own categories!
            </p>
          </div>

          {/* Topic Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topicNames.map((topic, idx) => {
              const topicData = TOPICS[topic];
              const colorClass = COLOR_CLASSES[topicData.color];
              const regularCategoryCount = Object.keys(topicData.categories).length;
              const customCategoryCount = customCategories[topic]?.length || 0;
              const totalCategoryCount = regularCategoryCount + customCategoryCount;
              
              return (
                <button
                  key={topic}
                  onClick={() => selectTopic(topic)}
                  className={`${colorClass.bg} border-2 ${colorClass.border} ${colorClass.box} p-6 rounded-2xl transition-all hover:scale-105 text-center topic-card-3d card-enter hover:animate-pulse-glow`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-5xl mb-3 icon-3d animate-bounce-in">{topicData.icon}</div>
                  <div className={`font-bold text-lg ${colorClass.text} animate-fade-in-up`}>{topic}</div>
                  <div className="text-gray-400 text-sm mt-1 animate-fade-in-up delay-200">
                    {totalCategoryCount} categories
                    {customCategoryCount > 0 && (
                      <span className="text-yellow-400 ml-1">
                        ({customCategoryCount} custom)
                      </span>
                    )}
                  </div>
                  <div className={`mt-3 ${colorClass.text} flex items-center justify-center gap-1 animate-fade-in-up delay-300`}>
                    SELECT <ChevronRight className="w-4 h-4 animate-fade-in-right" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scoreboard Preview */}
          <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-2 grid-3d animate-fade-in delay-500">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className={`${team.color.light} rounded-lg p-2 border-2 ${team.color.border} score-3d grid-item-3d hover:animate-pulse-glow`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`${team.color.text} font-bold text-xs truncate`}>{team.name}</div>
                <div className={`${team.color.text} text-xl font-bold animate-bounce-in`} style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>${team.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CATEGORY SELECTION PHASE
  if (phase === "categorySelect" && currentTopicData) {
    return (
      <div className="min-h-screen p-4 md:p-8 page-enter">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={changeTopic}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-semibold animate-fade-in-left hover:animate-pulse-glow"
          >
            <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
            CHANGE TOPIC
          </button>

          <div className="text-center mb-6 animate-fade-in-down delay-200">
            <div className="text-5xl mb-2 icon-3d animate-bounce-in">{currentTopicData.icon}</div>
            <h1 className={`pixel-font text-2xl md:text-4xl font-bold ${topicColor.text} mb-2 animate-glow-pulse`}>
              {selectedTopic}
            </h1>
            <p className="text-cyan-300 animate-fade-in-up delay-300">
              Select {numCategories} categories ({selectedCategories.length}/{numCategories})
            </p>
          </div>

          {/* Number of Categories Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="text-gray-400 self-center">Board size:</span>
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => {
                  const maxAvailable = availableCategories.length;
                  const newNum = Math.min(num, maxAvailable);
                  setNumCategories(newNum);
                  if (selectedCategories.length > newNum) {
                    setSelectedCategories(selectedCategories.slice(0, newNum));
                  }
                }}
                disabled={num > availableCategories.length}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  numCategories === num
                    ? `${topicColor.bg} ${topicColor.border} border-2 text-white ${topicColor.box}`
                    : num > availableCategories.length
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-400 border-2 border-gray-600 hover:border-gray-400"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={randomizeCategories}
              className={`neon-btn neon-btn-cyan px-4 py-2 flex items-center gap-2 btn-3d`}
            >
              <Shuffle className="w-4 h-4" />
              RANDOM
            </button>
            <button
              onClick={selectAllCategories}
              className="neon-btn neon-btn-pink px-4 py-2 btn-3d"
            >
              SELECT ALL
            </button>
          </div>

          {/* Add Custom Category Button */}
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="neon-btn neon-btn-purple px-6 py-3 flex items-center gap-2 btn-3d"
            >
              <Star className="w-5 h-5" />
              {showAddCategory ? "CANCEL" : "ADD CUSTOM CATEGORY"}
            </button>
          </div>

          {/* Custom Category Form */}
          {showAddCategory && (
            <div className={`neon-card ${topicColor.box} p-6 mb-6 card-3d`}>
              <h3 className={`text-xl font-bold ${topicColor.text} mb-4 text-center`}>
                ⭐ CREATE CUSTOM CATEGORY
              </h3>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-semibold">Category Name:</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white focus:outline-none focus:border-cyan-400"
                  maxLength={30}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-semibold">Questions & Answers:</label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {newCategoryQuestions.map((q, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border-2 border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${topicColor.text} font-bold text-sm`}>${q.points}</span>
                        <span className="text-gray-400 text-xs">Question {idx + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateNewQuestion(idx, "question", e.target.value)}
                        placeholder="Enter question..."
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white text-sm mb-2 focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => updateNewQuestion(idx, "answer", e.target.value)}
                        placeholder="Enter answer..."
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border-2 border-gray-600 text-white text-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={saveCustomCategory}
                disabled={!newCategoryName.trim()}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  newCategoryName.trim()
                    ? "neon-btn neon-btn-green btn-3d"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
                }`}
              >
                <Star className="w-5 h-5 inline mr-2" />
                SAVE AS POPULAR CATEGORY
              </button>
            </div>
          )}

          {/* Category Grid */}
          <div className={`neon-card ${topicColor.box} p-6 mb-6 card-3d animate-fade-in delay-400`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCategories.map((category, idx) => {
                const isSelected = selectedCategories.includes(category);
                const canSelect = selectedCategories.length < numCategories || isSelected;
                const isCustom = customCategories[selectedTopic || ""]?.some(cat => cat.name === category);
                
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    disabled={!canSelect}
                    className={`
                      p-4 rounded-xl font-bold text-sm transition-all text-center relative tile-3d
                      ${isSelected
                        ? `${topicColor.bg} ${topicColor.border} border-2 text-white ${topicColor.box} scale-105 animate-pulse`
                        : canSelect
                        ? "bg-gray-800/50 text-gray-300 border-2 border-gray-600 hover:border-gray-400 hover:animate-scale-up"
                        : "bg-gray-900/50 text-gray-600 cursor-not-allowed border-2 border-gray-800"
                      }
                    `}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {category}
                    {isCustom && (
                      <Star className="w-3 h-3 absolute top-1 right-1 text-yellow-400 fill-yellow-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Preview */}
          {selectedCategories.length > 0 && (
            <div className={`neon-card ${topicColor.box} p-4 mb-6 card-3d`}>
              <div className={`text-sm ${topicColor.text} font-semibold mb-2`}>YOUR BOARD:</div>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((cat, idx) => (
                  <span key={cat} className={`${topicColor.bg} ${topicColor.text} px-3 py-1 rounded-lg text-sm font-bold border ${topicColor.border}`}>
                    {idx + 1}. {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Playing Button */}
          <button
            onClick={startPlaying}
            disabled={selectedCategories.length < 1}
            className={`w-full py-5 rounded-xl text-xl font-bold transition-all flex items-center justify-center gap-3 ${
              selectedCategories.length >= 1
                ? "neon-btn neon-btn-green btn-3d"
                : "bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700"
            }`}
          >
            <Play className="w-6 h-6" />
            {selectedCategories.length >= 1 ? "START GAME!" : "SELECT AT LEAST 1 CATEGORY"}
          </button>
        </div>
      </div>
    );
  }

  // PLAYING PHASE - Jeopardy Board
  if (phase === "playing" && currentTopicData) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTopicData.icon}</span>
              <div>
                <h1 className={`pixel-font text-lg font-bold ${topicColor.text}`}>
                  {selectedTopic}
                </h1>
                <p className="text-sm text-gray-400">
                  <span className={currentTeam.color.text}>{currentTeam.name}</span>'s turn
                </p>
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="mb-4 grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 grid-3d">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className={`${team.color.light} rounded-lg p-1 md:p-2 border-2 ${team.color.border} ${
                  idx === currentTeamIndex ? `${team.color.glow} scale-105` : "opacity-70"
                } transition-all score-3d grid-item-3d`}
              >
                <div className={`${team.color.text} font-bold text-[10px] md:text-xs truncate`}>{team.name}</div>
                <div className={`${team.color.text} text-base md:text-xl font-bold`}>${team.score}</div>
              </div>
            ))}
          </div>

          {/* Jeopardy Board */}
          <div className={`neon-card ${topicColor.box} p-2 md:p-4 overflow-x-auto card-3d-enhanced container-3d parallax-3d`}>
            <div className="grid gap-1 md:gap-2 min-w-[400px] md:min-w-[500px]" style={{ gridTemplateColumns: `repeat(${selectedCategories.length}, 1fr)` }}>
              {/* Category Headers */}
              {selectedCategories.map((category) => (
                <div
                  key={category}
                  className={`${topicColor.bg} border-2 ${topicColor.border} rounded-lg p-2 md:p-3 text-center tile-3d`}
                >
                  <h3 className="font-bold text-[10px] md:text-xs lg:text-sm text-white leading-tight">
                    {category}
                  </h3>
                </div>
              ))}

              {/* Question Grid */}
              {[0, 1, 2, 3, 4].map((row) => (
                selectedCategories.map((category) => {
                  const questions = getCategoryData(category);
                  if (!questions || !questions[row]) return null;
                  const question = questions[row];
                  const questionKey = `${category}-${row}`;
                  const isUsed = usedQuestions.has(questionKey);

                  return (
                    <button
                      key={`${category}-${row}`}
                      onClick={() => !isUsed && selectQuestion(category, row)}
                      disabled={isUsed}
                      className={`
                        aspect-square rounded-lg font-bold text-sm md:text-xl lg:text-2xl transition-all flex items-center justify-center p-1 md:p-2
                        ${isUsed
                          ? "bg-gray-800/50 text-gray-700 cursor-not-allowed"
                          : `bg-blue-600 hover:bg-blue-500 text-yellow-300 hover:scale-105 cursor-pointer neon-box-cyan board-tile-3d`
                        }
                      `}
                    >
                      {isUsed ? "" : `$${question.points}`}
                    </button>
                  );
                })
              ))}
            </div>
          </div>

          {/* End Game Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setPhase("gameOver")}
              className="neon-btn neon-btn-pink px-8 py-3 btn-3d"
            >
              END GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION PHASE
  if (phase === "question" && selectedQuestion && currentTopicData) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl w-full mx-auto">
          {/* Scoreboard */}
          <div className="mb-4 md:mb-6 grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 grid-3d">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`${team.color.light} rounded-lg p-1 md:p-2 border-2 ${team.color.border} ${
                  buzzedTeam?.id === team.id ? `${team.color.glow} scale-110 animate-pulse glow-3d` : ""
                } transition-all score-3d grid-item-3d`}
              >
                <div className={`${team.color.text} font-bold text-[10px] md:text-xs truncate`}>{team.name}</div>
                <div className={`${team.color.text} text-base md:text-xl font-bold`}>${team.score}</div>
              </div>
            ))}
          </div>

          {/* Question Card */}
          <div className={`neon-card ${topicColor.box} p-4 md:p-8 text-center question-card-3d`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl md:text-2xl">{currentTopicData.icon}</span>
              <span className={`text-xs md:text-sm ${topicColor.text} font-semibold`}>
                {selectedQuestion.category}
              </span>
            </div>
            <div className={`pixel-font text-xl md:text-2xl lg:text-3xl font-bold ${topicColor.text} mb-4 text-3d`}>
              ${selectedQuestion.question.points}
            </div>
            
            <div className="bg-blue-900/50 rounded-2xl p-4 md:p-8 mb-8 border-2 border-blue-500/50">
              <p className="text-lg md:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
                {selectedQuestion.question.question}
              </p>
            </div>

            {/* Buzz In Section */}
            {!buzzedTeam ? (
              <div className="space-y-4">
                <h3 className="text-base md:text-xl font-bold text-pink-400 pixel-font text-xs md:text-sm mb-4">
                  🔔 BUZZ IN TO ANSWER!
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleBuzz(team)}
                      className={`${team.color.light} border-2 ${team.color.border} hover:${team.color.glow} p-2 md:p-4 rounded-xl transition-all hover:scale-105 font-bold text-sm md:text-base ${team.color.text} btn-3d`}
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNoAnswer}
                  className="mt-4 text-gray-400 hover:text-gray-300 underline"
                >
                  No one wants to answer? Reveal answer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`${buzzedTeam.color.light} border-2 ${buzzedTeam.color.border} ${buzzedTeam.color.glow} p-4 rounded-xl inline-block`}>
                  <span className={`text-xl font-bold ${buzzedTeam.color.text}`}>
                    🔔 {buzzedTeam.name} BUZZED IN!
                  </span>
                </div>

                {!showAnswer && (
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={revealAnswer}
                      className="neon-btn neon-btn-cyan px-8 py-4 text-lg btn-3d"
                    >
                      REVEAL ANSWER
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ANSWER PHASE
  if (phase === "answer" && selectedQuestion) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl w-full mx-auto">
          {/* Question Recap */}
          <div className={`neon-card ${topicColor.box} p-8 text-center mb-6 question-card-3d`}>
            <div className="text-sm text-gray-400 mb-2">Question:</div>
            <p className="text-xl text-white mb-6">
              {selectedQuestion.question.question}
            </p>
            
            <div className="bg-green-900/30 border-2 border-green-500 neon-box-green rounded-2xl p-4 md:p-6 mb-6">
              <div className="text-xs md:text-sm text-green-400 font-semibold mb-2">✓ CORRECT ANSWER</div>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-400 pixel-font">
                {selectedQuestion.question.answer}
              </p>
            </div>

            {buzzedTeam ? (
              <div className="space-y-4">
                <div className={`${buzzedTeam.color.text} font-bold text-lg`}>
                  Did {buzzedTeam.name} get it right?
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
                  <button
                    onClick={handleCorrect}
                    className="neon-btn neon-btn-green px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg flex items-center justify-center gap-2 btn-3d"
                  >
                    <Check className="w-4 h-4 md:w-6 md:h-6" />
                    CORRECT (+${selectedQuestion.question.points})
                  </button>
                  <button
                    onClick={handleIncorrect}
                    className="neon-btn neon-btn-pink px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg flex items-center justify-center gap-2 btn-3d"
                  >
                    <X className="w-4 h-4 md:w-6 md:h-6" />
                    WRONG (-${selectedQuestion.question.points})
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={continueFromAnswer}
                className="neon-btn neon-btn-cyan px-8 py-4 text-lg btn-3d"
              >
                CONTINUE →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER PHASE
  if (phase === "gameOver") {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const winner = sortedTeams[0];

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Winner Banner */}
          <div className={`${winner.color.light} rounded-2xl p-8 border-2 ${winner.color.border} ${winner.color.glow} text-center mb-8`}>
                  <div className="text-6xl mb-4 float-3d icon-3d">🏆</div>
            <div className="text-sm text-gray-400 mb-2">THE WINNER IS...</div>
            <h1 className={`pixel-font text-3xl md:text-5xl font-bold ${winner.color.text} mb-4 text-3d`}>
              {winner.name}
            </h1>
            <div className={`text-3xl font-bold ${winner.color.text} pixel-font text-3d`}>${winner.score}!</div>
          </div>

          {/* Final Standings */}
          <div className="neon-card neon-box-cyan p-8 mb-8 card-3d">
            <h2 className="text-xl font-bold text-cyan-400 mb-6 text-center pixel-font">FINAL STANDINGS</h2>
            <div className="space-y-4">
              {sortedTeams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`${team.color.light} rounded-xl p-4 border-2 ${team.color.border} ${idx === 0 ? team.color.glow : ''} flex items-center gap-4 score-card-3d`}
                >
                  <div className={`w-12 h-12 rounded-full ${team.color.bg} flex items-center justify-center text-black font-bold text-xl`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`${team.color.text} font-bold text-xl`}>{team.name}</div>
                  </div>
                  <div className={`${team.color.text} text-3xl font-bold pixel-font`}>${team.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={playAgain}
              className="neon-btn neon-btn-yellow py-5 text-lg flex items-center justify-center gap-2 btn-3d"
            >
              <Shuffle className="w-5 h-5" />
              NEW TOPIC
            </button>
            <button
              onClick={resetGame}
              className="neon-btn neon-btn-green py-5 text-lg flex items-center justify-center gap-2 btn-3d"
            >
              <RotateCcw className="w-5 h-5" />
              NEW GAME
            </button>
          </div>
          <Link
            href="/games"
            className="block w-full mt-4 neon-btn neon-btn-pink py-5 text-xl text-center btn-3d"
          >
            <ArrowLeft className="w-6 h-6 inline mr-2" />
            BACK TO GAMES
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
