import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }

    const { image, imageType, age, sex, language } = await req.json();

    console.log("Processing request for:", { age, sex, language, imageType });

    const prompt = `Analyze this blood test report for a ${age} year old ${sex} patient. For each test result:
    1. Extract the test name
    2. Extract the exact numerical value with its units
    3. Extract the reference range with units
    4. Compare the value to the reference range and classify as:
       - "Within Normal Range" if within range
       - "Outside Normal Range - Slight/Moderate" if slightly outside range
       - "Outside Normal Range - Significant" if significantly outside range
    5. Provide very detailed advice including:
       - Brief explanation of what this test measures and its importance
       
       Foods to Include:
       - List 4-6 specific foods with exact portions (e.g., "Spinach (2 cups raw)")
       - Include nutritional content for each food
       - Explain why each food helps
       
       Foods to Avoid:
       - List specific foods that might negatively impact the levels
       - Explain why each should be avoided
       - Include timing considerations if relevant
       
       Lifestyle Recommendations:
       - Specific exercise recommendations with duration and frequency
       - Sleep recommendations
       - Stress management techniques if relevant
       - Other lifestyle factors that could impact levels
       
       Supplements if needed:
       - Specific supplements with dosage
       - Best time to take them
       - Potential interactions to watch for
       - Duration of supplementation if applicable
    
    Format each result exactly as:
    Test Name: [name]
    Value: [numerical value with units]
    Range: [reference range with units]
    Status: [status based on comparison]
    Advice: [detailed advice following the structure above]
    
    Make the advice section very detailed and specific, similar to this example:
    "This test measures your hemoglobin levels, which is crucial for oxygen transport throughout your body.

    Foods to Include:
    - Lean beef (4 oz serving): Rich in heme iron (3.2mg) and B12, highly absorbable
    - Spinach (2 cups raw): Contains 3.2mg non-heme iron, vitamin C, and folate
    - Lentils (1 cup cooked): Provides 6.6mg iron, fiber, and plant protein
    - Oysters (3 oz): Exceptional source of iron (8mg) and zinc
    - Quinoa (1 cup cooked): Contains 2.8mg iron, complete protein, and fiber
    
    Foods to Avoid:
    - Coffee/Tea within 2 hours of iron-rich meals: Reduces iron absorption by 60%
    - Calcium-rich foods with iron sources: Interferes with iron absorption
    - High-phytate foods like unleavered whole grains: Bind to iron
    
    Lifestyle Recommendations:
    - Perform moderate cardio 30 minutes daily to improve oxygen circulation
    - Get 7-9 hours of quality sleep in a cool, dark room
    - Practice stress-reduction techniques like deep breathing for 10 minutes daily
    - Avoid intense exercise during peak supplementation times
    
    Supplements if needed:
    - Iron bisglycinate (25mg daily): More gentle on stomach
    - Take on empty stomach 1 hour before meals
    - Pair with Vitamin C (500mg) to enhance absorption
    - Continue for 3 months, then retest levels"
    
    Do not include any explanations or summaries outside of this format.`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: imageType,
              data: image
            }
          }
        ]
      }]
    };

    console.log("Sending request to Gemini API...");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Gemini API response received");

    const analysisText = result.candidates[0].content.parts[0].text;
    
    // Parse the response into structured data
    const testResults = [];
    const testBlocks = analysisText.split('\n\n');
    
    let currentResult = {};
    for (const block of testBlocks) {
      const lines = block.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('Test Name: ')) {
          if (Object.keys(currentResult).length > 0) {
            testResults.push(currentResult);
            currentResult = {};
          }
          currentResult.name = line.replace('Test Name: ', '').trim();
        } else if (line.startsWith('Value: ')) {
          currentResult.value = line.replace('Value: ', '').trim();
        } else if (line.startsWith('Range: ')) {
          currentResult.range = line.replace('Range: ', '').trim();
        } else if (line.startsWith('Status: ')) {
          currentResult.status = line.replace('Status: ', '').trim();
        } else if (line.startsWith('Advice: ')) {
          currentResult.advice = line.replace('Advice: ', '').trim();
        } else if (currentResult.advice) {
          currentResult.advice += '\n' + line;
        }
      }
    }
    
    if (Object.keys(currentResult).length > 0) {
      testResults.push(currentResult);
    }

    console.log("Parsed test results:", testResults);

    return new Response(
      JSON.stringify({ success: true, results: testResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-report function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        errorDetails: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});