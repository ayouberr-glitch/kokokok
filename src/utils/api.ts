import { supabase } from "@/integrations/supabase/client";

interface AnalysisRequest {
  image: File;
  age: number;
  sex: string;
  language: string;
}

export const analyzeReport = async (data: AnalysisRequest) => {
  try {
    // Convert image to base64
    const imageBuffer = await data.image.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // Prepare the payload
    const payload = {
      image: base64Image,
      imageType: data.image.type,
      age: data.age,
      sex: data.sex,
      language: data.language
    };

    console.log("Calling analyze-report function with payload:", {
      ...payload,
      image: `${payload.image.substring(0, 50)}...` // Log truncated image data
    });

    const { data: response, error } = await supabase.functions.invoke('analyze-report', {
      body: payload
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Analysis failed');
    }

    if (!response) {
      throw new Error('No response from analysis function');
    }

    console.log("Analysis response:", response);
    return response.results;
  } catch (error) {
    console.error('Error analyzing report:', error);
    throw error;
  }
};