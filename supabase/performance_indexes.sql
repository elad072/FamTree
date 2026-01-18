-- Add indexes to optimize family member queries
CREATE INDEX IF NOT EXISTS idx_family_members_father_id ON public.family_members(father_id);
CREATE INDEX IF NOT EXISTS idx_family_members_mother_id ON public.family_members(mother_id);
CREATE INDEX IF NOT EXISTS idx_family_members_spouse_id ON public.family_members(spouse_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_by_id ON public.family_members(created_by_id);
CREATE INDEX IF NOT EXISTS idx_family_members_status ON public.family_members(status);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON public.family_members(email);

-- Add indexes to optimize message queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
