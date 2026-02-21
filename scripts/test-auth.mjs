import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpgktpubyrdrnodduvoc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ2t0cHVieXJkcm5vZGR1dm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODQ2NTgsImV4cCI6MjA4NzI2MDY1OH0.s88Mg3bMqA9zMbBlUgGbBoVrManhu97ZF5U7ByRdbJM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    const email = `test_${Date.now()}@ginez.com`;
    console.log('Testing auth signup with...', email);

    const { data, error } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: {
            data: {
                nombre_completo: 'Test User',
                rol: 'admin'
            }
        }
    });

    if (error) {
        console.error('SIGNUP ERROR:', error);
    } else {
        console.log('SIGNUP SUCCESS:', data.user?.id);
    }
}

testAuth();
