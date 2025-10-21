import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { vendor, menu } = await req.json();

    // 1. Add the vendor
    const { data: vendorData, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .insert([
        {
          name: vendor.name,
          description: vendor.description,
          category: vendor.category,
          image_url: vendor.image_url,
        },
      ])
      .select()
      .single();

    if (vendorError) {
      throw vendorError;
    }

    // 2. Add the menu items
    const menuItems = menu.map((item) => ({
      ...item,
      vendor_id: vendorData.id,
    }));

    const { error: menuError } = await supabaseAdmin
      .from("menus")
      .insert(menuItems);

    if (menuError) {
      throw menuError;
    }

    return new Response(JSON.stringify({ vendor: vendorData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
