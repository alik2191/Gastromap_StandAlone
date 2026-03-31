-- Add Admin User
-- Email: alik2191@gmail.com
-- Password: Vitalya_219
-- Date: 2026-03-31

-- IMPORTANT: This script should be run AFTER the user signs up
-- It assigns the admin role to the user with the specified email

-- Step 1: Find the user by email and assign admin role
INSERT INTO public.user_roles (user_id, role, permissions, granted_at)
SELECT 
    id,
    'admin',
    '["all"]'::jsonb,
    NOW()
FROM auth.users
WHERE email = 'alik2191@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    permissions = '["all"]'::jsonb,
    updated_at = NOW();

-- Verify admin was created
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'admin';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  No admin user found. Please sign up first.';
    ELSE
        RAISE NOTICE '✅ Admin user assigned successfully!';
    END IF;
END $$;

-- Display admin user info (for verification)
SELECT 
    u.email,
    r.role,
    r.permissions,
    r.granted_at
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE r.role = 'admin'
  AND u.email = 'alik2191@gmail.com';
