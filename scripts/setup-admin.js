#!/usr/bin/env node

/**
 * Admin Setup Script
 * 
 * Creates admin user in Supabase database
 * Email: alik2191@gmail.com
 * Password: Vitalya_219
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config(path.join(__dirname, '../.env'))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env')
    console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const ADMIN_EMAIL = 'alik2191@gmail.com'
const ADMIN_PASSWORD = 'Vitalya_219'

async function setupAdmin() {
    console.log('🔧 Setting up admin user...')
    console.log(`📧 Email: ${ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
    console.log('---')
    
    try {
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('user_roles')
            .select(`
                id,
                user_id,
                role,
                users:auth_users (
                    email
                )
            `)
            .eq('role', 'admin')
            .single()
        
        if (existingUser && existingUser.users?.email === ADMIN_EMAIL) {
            console.log('✅ Admin user already exists!')
            console.log(`   User ID: ${existingUser.user_id}`)
            return
        }
        
        // Sign up new user
        console.log('📝 Creating user account...')
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })
        
        if (signUpError) {
            if (signUpError.message.includes('User already registered')) {
                console.log('⚠️  User already registered, assigning admin role...')
                // Find existing user and assign admin role
                const { data: userData, error: userError } = await supabase
                    .from('user_roles')
                    .select('user_id')
                    .is('role', null)
                    .limit(1)
                    .single()
                
                if (userError && userError.code !== 'PGRST116') {
                    throw userError
                }
                
                // For existing user, we need to use service role to update
                console.log('⚠️  Please manually assign admin role in Supabase dashboard')
                console.log('   Or use the SQL below:')
                console.log('---')
                console.log(`INSERT INTO public.user_roles (user_id, role, permissions)`)
                console.log(`SELECT id, 'admin', '[]'::jsonb FROM auth.users WHERE email = '${ADMIN_EMAIL}';`)
                return
            }
            throw signUpError
        }
        
        if (!authData?.user) {
            throw new Error('No user data returned from signup')
        }
        
        console.log('✅ User created successfully!')
        console.log(`   User ID: ${authData.user.id}`)
        
        // Assign admin role
        console.log('👑 Assigning admin role...')
        const { error: roleError } = await supabase
            .from('user_roles')
            .update({ 
                role: 'admin',
                permissions: ['all']
            })
            .eq('user_id', authData.user.id)
        
        if (roleError) {
            throw roleError
        }
        
        console.log('✅ Admin role assigned!')
        console.log('---')
        console.log('🎉 Admin setup complete!')
        console.log('')
        console.log('📋 Login credentials:')
        console.log(`   Email: ${ADMIN_EMAIL}`)
        console.log(`   Password: ${ADMIN_PASSWORD}`)
        console.log('')
        console.log('⚠️  IMPORTANT: Change your password after first login!')
        console.log('')
        
    } catch (error) {
        console.error('❌ Error setting up admin:', error.message)
        console.error('')
        console.error('Full error:', error)
        process.exit(1)
    }
}

// Run setup
setupAdmin()
