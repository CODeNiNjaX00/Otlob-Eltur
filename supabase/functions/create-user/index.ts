import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, name, role, address, restaurantId } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Set to true to send a confirmation email.
      user_metadata: {
        full_name: name,
        address: address,
      }
    })

    if (authError) {
      throw authError
    }

    // The trigger will create the profile. Now we need to update the role and restaurantId if provided.
    if (role || restaurantId) {
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ 
                role: role,
                restaurant_id: restaurantId
            })
            .eq('id', authData.user.id)
            .select()
            .single();
        
        if (profileError) {
            throw profileError;
        }
        return new Response(JSON.stringify(profileData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }


    return new Response(JSON.stringify(authData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})