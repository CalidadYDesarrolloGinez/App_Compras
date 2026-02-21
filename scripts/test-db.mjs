import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpgktpubyrdrnodduvoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ2t0cHVieXJkcm5vZGR1dm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY4NDY1OCwiZXhwIjoyMDg3MjYwNjU4fQ.HNYUWBvgmWn7tNMpqcUO2gQxGBQQMhyAH3DIgLdlODo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log('Testing DB connection by reading profiles limit 1...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) {
        console.error('Error reading profiles:', pError);
    } else {
        console.log('Profiles table EXISTS.', profiles);
    }

    // Delete the trigger using REST RPC? Supabase JS does not allow raw query execution without RPC. 
    // Let's just create the user directly in auth.users via REST API but we can't bypass the trigger.
    // BUT wait, what if we pass `user_metadata` directly so the JSON is not null?

    console.log('Trying to create user again with valid metadata...');
    const { data: userCreated, error: userError } = await supabase.auth.admin.createUser({
        email: 'admin2@ginez.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
            nombre_completo: 'Admin Test',
            rol: 'admin'
        }
    });

    if (userError) {
        console.error('STILL ERROR creating user:', userError.message);
    } else {
        console.log('SUCCESS creating user admin2@ginez.com');
    }
}

run();
