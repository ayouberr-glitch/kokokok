import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Apple, 
  XCircle, 
  Activity, 
  Pill,
  Clock,
  Utensils,
  Leaf,
  Timer,
  Heart
} from "lucide-react";

interface TestResult {
  name: string;
  value: string;
  range: string;
  status: string;
  advice?: string;
}

interface ResultsDisplayProps {
  results: TestResult[];
}

export const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const [openAdvice, setOpenAdvice] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    if (status.includes("Within Normal Range")) return "bg-green-500 text-white";
    if (status.includes("Slight") || status.includes("Moderate")) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const toggleAdvice = (resultName: string) => {
    setOpenAdvice(prev => 
      prev.includes(resultName)
        ? prev.filter(name => name !== resultName)
        : [...prev, resultName]
    );
  };

  const formatAdviceSection = (section: string, icon: React.ReactNode, bgColor: string) => {
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    return (
      <div className={`mt-6 p-6 rounded-xl ${bgColor} backdrop-blur-lg shadow-lg transition-all duration-300 hover:shadow-xl`}>
        <div className="flex items-center gap-3 font-semibold text-gray-800 mb-4">
          {icon}
          <span className="text-lg">{lines[0].replace(':', '')}</span>
        </div>
        <ul className="space-y-3">
          {lines.slice(1).map((line, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-700">
              <Leaf className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-base">{line.trim()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const formatAdvice = (advice: string) => {
    const sections = advice.split('\n\n');
    return sections.map((section, index) => {
      if (section.toLowerCase().includes('foods to include')) {
        return formatAdviceSection(
          section, 
          <Utensils className="w-6 h-6 text-green-600" />,
          'bg-green-50/80'
        );
      }
      if (section.toLowerCase().includes('foods to avoid')) {
        return formatAdviceSection(
          section, 
          <XCircle className="w-6 h-6 text-red-600" />,
          'bg-red-50/80'
        );
      }
      if (section.toLowerCase().includes('lifestyle')) {
        return formatAdviceSection(
          section, 
          <Activity className="w-6 h-6 text-blue-600" />,
          'bg-blue-50/80'
        );
      }
      if (section.toLowerCase().includes('supplements')) {
        return formatAdviceSection(
          section, 
          <Pill className="w-6 h-6 text-purple-600" />,
          'bg-purple-50/80'
        );
      }
      if (section.toLowerCase().includes('timing') || section.toLowerCase().includes('when')) {
        return formatAdviceSection(
          section,
          <Timer className="w-6 h-6 text-orange-600" />,
          'bg-orange-50/80'
        );
      }
      return (
        <div key={index} className="mt-4 p-6 bg-gray-50/80 rounded-xl backdrop-blur-lg">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-6 h-6 text-medical-600" />
            <span className="font-medium text-gray-800">Overview</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {section.trim()}
          </p>
        </div>
      );
    });
  };

  if (!results || results.length === 0) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto mt-6">
        <AlertTitle>Error Loading Results</AlertTitle>
        <AlertDescription>
          No test results were found. Please try again or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn p-6">
      {results.map((result, index) => (
        <Card key={index} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">{result.name}</h3>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                {result.status}
              </span>
            </div>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-xl text-medical-700">{result.value}</span>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-gray-600">{result.range}</span>
              </div>
            </div>
            
            {result.advice && (
              <Collapsible
                open={openAdvice.includes(result.name)}
                onOpenChange={() => toggleAdvice(result.name)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg bg-medical-50 hover:bg-medical-100 transition-colors">
                  {openAdvice.includes(result.name) ? 
                    <ChevronDown className="w-5 h-5 text-medical-600" /> : 
                    <ChevronRight className="w-5 h-5 text-medical-600" />
                  }
                  <span className="text-sm font-medium text-medical-700">
                    View Detailed Recommendations
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-6">
                  <div className="space-y-6">
                    {formatAdvice(result.advice)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};