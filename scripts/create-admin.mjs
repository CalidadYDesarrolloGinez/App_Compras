import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpgktpubyrdrnodduvoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ2t0cHVieXJkcm5vZGR1dm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY4NDY1OCwiZXhwIjoyMDg3MjYwNjU4fQ.HNYUWBvgmWn7tNMpqcUO2gQxGBQQMhyAH3DIgLdlODo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'calidadydesarrolloginez@gmail.com';
    console.log(`Intentando crear/actualizar el usuario administrador: ${email}`);

    // 1. Create User
    const { data: userCreated, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
            nombre_completo: 'Administrador Ginez',
            rol: 'admin'
        }
    });

    let userId;

    if (userError) {
        if (userError.message.includes('already registered')) {
            console.log('El usuario ya existe en Auth. Buscándolo...');
            const { data: users, error: listError } = await supabase.auth.admin.listUsers();
            if (!listError) {
                const u = users.users.find(u => u.email === email);
                if (u) userId = u.id;
            }
        } else {
            console.error('Error al crear usuario auth:', userError.message);
            return;
        }
    } else {
        userId = userCreated.user.id;
        console.log('Usuario creado exitosamente en Auth.');
    }

    if (!userId) {
        console.error('No se pudo determinar el ID del usuario.');
        return;
    }

    // 2. Ensure Profile exists and is admin
    // The trigger might have failed previously or not created the profile with admin. Let's explicitly upsert.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            nombre_completo: 'Administrador Ginez',
            rol: 'admin'
        });

    if (profileError) {
        console.error('Error al asegurar perfil admin:', profileError.message);
    } else {
        console.log('¡Listo! El usuario tiene acceso completo a la aplicacion.');
    }
}

createAdmin();
