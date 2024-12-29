import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { UserForm } from '@/components/UserForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { ShareOptions } from '@/components/ShareOptions';
import { useToast } from '@/hooks/use-toast';
import { analyzeReport } from '@/utils/api';
import { generatePDF } from '@/utils/pdf';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    toast({
      title: "File uploaded successfully",
      description: "You can now proceed with the analysis.",
    });
  };

  const handleFormSubmit = async (formData: any) => {
    console.log("Form submitted with data:", formData);
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a medical report first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending analysis request...");
      const response = await analyzeReport({
        image: file,
        age: parseInt(formData.age),
        sex: formData.sex,
        language: formData.language,
      });
      console.log("Analysis response:", response);
      setResults(response);
      toast({
        title: "Analysis complete",
        description: "Your results are ready to view.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF('results-container');
      toast({
        title: "PDF downloaded",
        description: "Your report has been saved as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleShareLink = () => {
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleShareEmail = () => {
    toast({
      title: "Share via email",
      description: "Opening email client...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Medical Report Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Upload your medical report and get instant insights
          </p>
        </div>

        <div className="space-y-8">
          <FileUpload onFileSelect={handleFileSelect} />
          
          <div className="glass-card rounded-xl p-6">
            <UserForm onSubmit={handleFormSubmit} />
          </div>

          {isLoading && (
            <div className="text-center">
              <p className="text-lg">Analyzing your report...</p>
            </div>
          )}

          {results && (
            <div id="results-container">
              <ResultsDisplay results={results} />
              <ShareOptions
                onDownloadPDF={handleDownloadPDF}
                onShareLink={handleShareLink}
                onShareEmail={handleShareEmail}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;