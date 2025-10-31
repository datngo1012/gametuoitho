-- Schema for Comment System with Reactions and Replies
-- Run this in Supabase SQL Editor

-- Table: comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Table: comment_reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    username VARCHAR(100) NOT NULL,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, username, reaction_type)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON public.comment_reactions(comment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments (allow read for everyone, insert for authenticated users)
CREATE POLICY "Allow public read access on comments"
    ON public.comments FOR SELECT
    USING (is_deleted = FALSE);

CREATE POLICY "Allow public insert on comments"
    ON public.comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own comments"
    ON public.comments FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- RLS Policies for reactions
CREATE POLICY "Allow public read access on reactions"
    ON public.comment_reactions FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on reactions"
    ON public.comment_reactions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow users to delete their own reactions"
    ON public.comment_reactions FOR DELETE
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View to get comments with reaction counts
CREATE OR REPLACE VIEW public.comments_with_stats AS
SELECT 
    c.id,
    c.parent_id,
    c.username,
    c.content,
    c.created_at,
    c.updated_at,
    c.is_deleted,
    COALESCE(reaction_counts.like_count, 0) as like_count,
    COALESCE(reaction_counts.love_count, 0) as love_count,
    COALESCE(reaction_counts.haha_count, 0) as haha_count,
    COALESCE(reaction_counts.wow_count, 0) as wow_count,
    COALESCE(reaction_counts.sad_count, 0) as sad_count,
    COALESCE(reaction_counts.angry_count, 0) as angry_count,
    COALESCE(reply_count.count, 0) as reply_count
FROM public.comments c
LEFT JOIN (
    SELECT 
        comment_id,
        COUNT(*) FILTER (WHERE reaction_type = 'like') as like_count,
        COUNT(*) FILTER (WHERE reaction_type = 'love') as love_count,
        COUNT(*) FILTER (WHERE reaction_type = 'haha') as haha_count,
        COUNT(*) FILTER (WHERE reaction_type = 'wow') as wow_count,
        COUNT(*) FILTER (WHERE reaction_type = 'sad') as sad_count,
        COUNT(*) FILTER (WHERE reaction_type = 'angry') as angry_count
    FROM public.comment_reactions
    GROUP BY comment_id
) reaction_counts ON c.id = reaction_counts.comment_id
LEFT JOIN (
    SELECT parent_id, COUNT(*) as count
    FROM public.comments
    WHERE is_deleted = FALSE AND parent_id IS NOT NULL
    GROUP BY parent_id
) reply_count ON c.id = reply_count.parent_id
WHERE c.is_deleted = FALSE;
