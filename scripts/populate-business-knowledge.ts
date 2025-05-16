import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initial business knowledge data
const businessKnowledge = [
  {
    category: 'startup',
    content: 'The lean startup methodology emphasizes rapid prototyping, validated learning, and iterative product releases to reduce market risks.',
    source: 'The Lean Startup by Eric Ries'
  },
  {
    category: 'market',
    content: 'Market validation is crucial before scaling. Test your MVP with real users and gather feedback to iterate quickly.',
    source: 'Startup Playbook'
  },
  {
    category: 'finance',
    content: 'Key metrics for early-stage startups include CAC, LTV, burn rate, and runway. Monitor these closely for sustainable growth.',
    source: 'VC Investment Guide'
  },
  {
    category: 'strategy',
    content: 'Focus on achieving product-market fit before scaling. This is the most critical phase for startup success.',
    source: 'Zero to One by Peter Thiel'
  },
  {
    category: 'legal',
    content: 'Early-stage startups should prioritize intellectual property protection, especially for core technology and brand assets.',
    source: 'Startup Legal Guide'
  },
  // Add more business knowledge entries here
];

async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function populateDatabase() {
  try {
    for (const knowledge of businessKnowledge) {
      // Generate embedding for the content
      const embedding = await generateEmbedding(knowledge.content);

      // Insert into Supabase
      const { error } = await supabase
        .from('business_knowledge')
        .insert({
          ...knowledge,
          embedding,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting knowledge:', error);
      } else {
        console.log('Successfully inserted:', knowledge.content.substring(0, 50) + '...');
      }
    }
    console.log('Database population completed!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the population script
populateDatabase(); 