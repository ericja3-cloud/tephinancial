import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

async function run() {
  // Check if user exists
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'stephani.andreoni@gmail.com',
    password: 'Ste150101.',
    email_confirm: true, // auto-confirm email
    user_metadata: { full_name: 'Stephani Andreoni' }
  })
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('User already exists, updating password...')
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find(u => u.email === 'stephani.andreoni@gmail.com')
      if (user) {
        await supabase.auth.admin.updateUserById(user.id, { password: 'Ste150101.' })
        console.log('Password updated successfully.')
      }
    } else {
      console.error('Error creating user:', error)
    }
  } else {
    console.log('User created successfully:', data.user.email)
  }
}

run()
