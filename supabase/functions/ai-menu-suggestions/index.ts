import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentOrderItems, menuItems } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create context for AI
    const orderContext = currentOrderItems?.length 
      ? `Current order contains: ${currentOrderItems.map((item: any) => item.name).join(', ')}`
      : 'No items in current order';
    
    const menuContext = `Available menu items: ${menuItems.map((item: any) => 
      `${item.name} (₹${item.price}, ${item.category})`
    ).join(', ')}`;

    const prompt = `You are a restaurant upselling AI assistant. ${orderContext}. ${menuContext}.
    
    Suggest 2-3 menu items that would pair well with the current order or boost order value.
    For each suggestion, provide:
    - item_name: exact name from the menu
    - reason: brief compelling reason (max 15 words)
    - confidence: number between 70-95
    
    Respond ONLY with valid JSON array format:
    [{"item_name": "...", "reason": "...", "confidence": 85}]`;

    console.log('Calling AI with prompt:', prompt);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful restaurant upselling assistant. Always respond with valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI API request failed');
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', aiData);

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse AI response
    let suggestions = [];
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      suggestions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback suggestions
      suggestions = [
        { item_name: menuItems[0]?.name || 'Popular Item', reason: 'Highly recommended by our chef', confidence: 85 }
      ];
    }

    // Match suggestions with actual menu items
    const enrichedSuggestions = suggestions.map((suggestion: any) => {
      const menuItem = menuItems.find((item: any) => 
        item.name.toLowerCase() === suggestion.item_name.toLowerCase()
      );
      
      return {
        item: menuItem || menuItems[0],
        reason: suggestion.reason,
        confidence: suggestion.confidence
      };
    }).filter((s: any) => s.item);

    console.log('Returning suggestions:', enrichedSuggestions);

    return new Response(
      JSON.stringify({ suggestions: enrichedSuggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-menu-suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});