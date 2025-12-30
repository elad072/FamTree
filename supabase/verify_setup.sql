-- ============================================
-- VERIFICATION & DEBUGGING QUERIES
-- Run these to diagnose issues
-- ============================================

-- 1. Check if table exists
SELECT 
    table_schema,
    table_name,
    'Table exists!' as status
FROM information_schema.tables 
WHERE table_name = 'family_members';

-- 2. List all columns in the table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'family_members'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'family_members';

-- 4. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'family_members';

-- 5. Count records in table
SELECT 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_records,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_records
FROM public.family_members;

-- 6. View sample data
SELECT 
    id,
    name,
    status,
    created_date
FROM public.family_members
LIMIT 5;

-- 7. Check for schema conflicts
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE tablename LIKE '%family%';

-- 8. Verify current database and schema
SELECT 
    current_database() as database,
    current_schema() as schema,
    current_user as user;

-- 9. Check table permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'family_members';

-- 10. Test a simple query (should work if everything is set up correctly)
SELECT 'Connection successful!' as message, NOW() as timestamp;
