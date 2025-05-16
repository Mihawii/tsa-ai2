-- Create the business_knowledge table
CREATE TABLE IF NOT EXISTS business_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('startup', 'market', 'finance', 'strategy', 'legal')),
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    relevance_score FLOAT,
    embedding vector(1536)
);

-- Create an index for faster similarity searches
CREATE INDEX IF NOT EXISTS business_knowledge_embedding_idx ON business_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create a function to update the relevance score
CREATE OR REPLACE FUNCTION update_relevance_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate relevance score based on recency and content quality
    NEW.relevance_score = 
        CASE 
            WHEN NEW.category = 'startup' THEN 1.0
            WHEN NEW.category = 'market' THEN 0.9
            WHEN NEW.category = 'finance' THEN 0.8
            WHEN NEW.category = 'strategy' THEN 0.7
            WHEN NEW.category = 'legal' THEN 0.6
            ELSE 0.5
        END * 
        (1.0 - EXTRACT(EPOCH FROM (NOW() - NEW.timestamp)) / (365 * 24 * 60 * 60));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update relevance score
CREATE TRIGGER update_business_knowledge_relevance
    BEFORE INSERT OR UPDATE ON business_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_relevance_score();

-- Insert some initial business knowledge
INSERT INTO business_knowledge (category, content, source) VALUES
('startup', 'The lean startup methodology emphasizes rapid prototyping, validated learning, and iterative product releases to reduce market risks.', 'The Lean Startup by Eric Ries'),
('market', 'Market validation is crucial before scaling. Test your MVP with real users and gather feedback to iterate quickly.', 'Startup Playbook'),
('finance', 'Key metrics for early-stage startups include CAC, LTV, burn rate, and runway. Monitor these closely for sustainable growth.', 'VC Investment Guide'),
('strategy', 'Focus on achieving product-market fit before scaling. This is the most critical phase for startup success.', 'Zero to One by Peter Thiel'),
('legal', 'Early-stage startups should prioritize intellectual property protection, especially for core technology and brand assets.', 'Startup Legal Guide'); 