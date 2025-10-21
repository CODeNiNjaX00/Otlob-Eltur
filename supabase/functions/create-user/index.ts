import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, name, role, address, vendorId } = await req.json()

    // Prepare the data for signUp, mapping vendorId to vendor_id
    const signUpData = {
      name,
      role,
      address,
      ...(vendorId && { vendor_id: vendorId }),
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: signUpData,
      }
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), {
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