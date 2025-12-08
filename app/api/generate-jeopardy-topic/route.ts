import { NextRequest, NextResponse } from 'next/server';

// Enhanced local topic generator - creates great questions automatically!
function generateLocalTopic(topic: string) {
  const topicLower = topic.toLowerCase().trim();
  
  // Emoji and color mapping
  const emojiMap: Record<string, string> = {
    'harry potter': '⚡', 'potter': '⚡',
    'marvel': '🦸', 'superhero': '🦸', 'comics': '🦸',
    'star wars': '⭐', 'wars': '⭐',
    'disney': '🏰', 'animation': '🏰',
    'music': '🎵', 'songs': '🎵', 'artists': '🎵',
    'movies': '🎬', 'films': '🎬', 'cinema': '🎬',
    'sports': '⚽', 'football': '⚽', 'basketball': '🏀',
    'science': '🔬', 'biology': '🔬', 'chemistry': '🔬',
    'history': '📜', 'war': '📜', 'ancient': '📜',
    'geography': '🌍', 'countries': '🌍', 'cities': '🌍',
    'food': '🍕', 'cooking': '🍕', 'cuisine': '🍕',
    'animals': '🐾', 'wildlife': '🐾', 'nature': '🐾',
    'technology': '💻', 'computers': '💻', 'tech': '💻',
    'literature': '📚', 'books': '📚', 'authors': '📚',
    'games': '🎮', 'gaming': '🎮', 'video games': '🎮',
    'space': '🚀', 'astronomy': '🚀', 'planets': '🚀',
    'art': '🎨', 'painting': '🎨', 'artist': '🎨',
    'math': '🔢', 'mathematics': '🔢', 'numbers': '🔢',
  };
  
  const colorMap: Record<string, string> = {
    'harry potter': 'purple', 'potter': 'purple',
    'marvel': 'cyan', 'superhero': 'cyan', 'comics': 'cyan',
    'star wars': 'yellow', 'wars': 'yellow',
    'disney': 'pink', 'animation': 'pink',
    'music': 'pink', 'songs': 'pink', 'artists': 'pink',
    'movies': 'orange', 'films': 'orange', 'cinema': 'orange',
    'sports': 'green', 'football': 'green', 'basketball': 'green',
    'science': 'cyan', 'biology': 'cyan', 'chemistry': 'cyan',
    'history': 'yellow', 'war': 'yellow', 'ancient': 'yellow',
    'geography': 'green', 'countries': 'green', 'cities': 'green',
    'food': 'orange', 'cooking': 'orange', 'cuisine': 'orange',
    'animals': 'green', 'wildlife': 'green', 'nature': 'green',
    'technology': 'cyan', 'computers': 'cyan', 'tech': 'cyan',
    'literature': 'purple', 'books': 'purple', 'authors': 'purple',
    'games': 'cyan', 'gaming': 'cyan', 'video games': 'cyan',
    'space': 'cyan', 'astronomy': 'cyan', 'planets': 'cyan',
    'art': 'pink', 'painting': 'pink', 'artist': 'pink',
    'math': 'yellow', 'mathematics': 'yellow', 'numbers': 'yellow',
  };
  
  // Find matching emoji and color
  let icon = '🎯';
  let color = 'cyan';
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (topicLower.includes(key)) {
      icon = emoji;
      break;
    }
  }
  
  for (const [key, col] of Object.entries(colorMap)) {
    if (topicLower.includes(key)) {
      color = col;
      break;
    }
  }
  
  // Enhanced category templates with more variety
  const categoryTemplates = [
    { name: 'Basics', type: 'basic' },
    { name: 'History', type: 'history' },
    { name: 'Key Facts', type: 'facts' },
    { name: 'Important People', type: 'people' },
    { name: 'Details', type: 'details' },
    { name: 'Advanced Concepts', type: 'advanced' },
  ];
  
  // Enhanced question generators by category type
  const generateQuestion = (categoryType: string, difficulty: number, topic: string): { question: string; answer: string } => {
    const points = difficulty;
    const topicCap = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    switch (categoryType) {
      case 'basic':
        if (points === 100) {
          return {
            question: `What is ${topic} most commonly known for?`,
            answer: `The primary characteristic or purpose of ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `In what category or field does ${topic} belong?`,
            answer: `The main category or field of ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What is a fundamental aspect of ${topic}?`,
            answer: `A core element or principle of ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What defines the essence of ${topic}?`,
            answer: `The defining characteristics of ${topic}`
          };
        } else {
          return {
            question: `What are the foundational principles of ${topic}?`,
            answer: `The fundamental principles underlying ${topic}`
          };
        }
        
      case 'history':
        if (points === 100) {
          return {
            question: `When did ${topic} first become significant or popular?`,
            answer: `The period when ${topic} gained prominence`
          };
        } else if (points === 200) {
          return {
            question: `What historical event is most associated with ${topic}?`,
            answer: `A key historical event related to ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `How did ${topic} evolve or develop over time?`,
            answer: `The evolution and development of ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What is the historical significance of ${topic}?`,
            answer: `The historical importance and impact of ${topic}`
          };
        } else {
          return {
            question: `What are the key historical milestones of ${topic}?`,
            answer: `Significant historical milestones in ${topic}`
          };
        }
        
      case 'facts':
        if (points === 100) {
          return {
            question: `What is a basic fact about ${topic}?`,
            answer: `A fundamental fact regarding ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `How many main components or parts does ${topic} typically have?`,
            answer: `The number of main components in ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What is a notable statistic or number related to ${topic}?`,
            answer: `A significant statistic about ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What are the key measurements or metrics for ${topic}?`,
            answer: `Important measurements or metrics of ${topic}`
          };
        } else {
          return {
            question: `What complex data or statistics define ${topic}?`,
            answer: `Complex statistical data about ${topic}`
          };
        }
        
      case 'people':
        if (points === 100) {
          return {
            question: `Who is most famously associated with ${topic}?`,
            answer: `A well-known person related to ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `Who created, invented, or founded ${topic}?`,
            answer: `The creator or founder of ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `Who are the key figures or leaders in ${topic}?`,
            answer: `Important figures or leaders in ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `Who made significant contributions to ${topic}?`,
            answer: `People who contributed significantly to ${topic}`
          };
        } else {
          return {
            question: `Who are the experts or specialists in ${topic}?`,
            answer: `Renowned experts or specialists in ${topic}`
          };
        }
        
      case 'details':
        if (points === 100) {
          return {
            question: `What is a specific detail or feature of ${topic}?`,
            answer: `A specific detail about ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `What are the main characteristics of ${topic}?`,
            answer: `Key characteristics of ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What specific elements make up ${topic}?`,
            answer: `The component elements of ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What are the intricate details that define ${topic}?`,
            answer: `Complex details that define ${topic}`
          };
        } else {
          return {
            question: `What are the most nuanced aspects of ${topic}?`,
            answer: `The most subtle and nuanced aspects of ${topic}`
          };
        }
        
      case 'advanced':
        if (points === 100) {
          return {
            question: `What is an important concept related to ${topic}?`,
            answer: `An important concept in ${topic}`
          };
        } else if (points === 200) {
          return {
            question: `What theory or framework applies to ${topic}?`,
            answer: `A theoretical framework for ${topic}`
          };
        } else if (points === 300) {
          return {
            question: `What are the advanced principles of ${topic}?`,
            answer: `Advanced principles underlying ${topic}`
          };
        } else if (points === 400) {
          return {
            question: `What is the deeper meaning or significance of ${topic}?`,
            answer: `The deeper significance and meaning of ${topic}`
          };
        } else {
          return {
            question: `What are the most sophisticated concepts within ${topic}?`,
            answer: `The most advanced and sophisticated concepts in ${topic}`
          };
        }
        
      default:
        return {
          question: `What is an important aspect of ${topic}?`,
          answer: `An important aspect of ${topic}`
        };
    }
  };
  
  // Generate categories and questions
  const categories: Record<string, any[]> = {};
  
  // Shuffle category templates for variety
  const shuffledCategories = [...categoryTemplates].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < 6; i++) {
    const catTemplate = shuffledCategories[i];
    const categoryName = `${catTemplate.name} of ${topic}`;
    const questions: any[] = [];
    
    // Generate 5 questions for this category (100, 200, 300, 400, 500 points)
    for (let j = 0; j < 5; j++) {
      const points = [100, 200, 300, 400, 500][j];
      const { question, answer } = generateQuestion(catTemplate.type, points, topic);
      
      questions.push({
        question,
        answer,
        points,
      });
    }
    
    categories[categoryName] = questions;
  }
  
  return {
    icon,
    color,
    categories,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate topic using enhanced local generator
    const generatedTopic = generateLocalTopic(topic);
    return NextResponse.json(generatedTopic);
    
  } catch (error: any) {
    console.error('Error generating Jeopardy topic:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate topic' },
      { status: 500 }
    );
  }
}
