import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UserFormData {
  age: string;
  sex: string;
  language: string;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
}

export const UserForm = ({ onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    age: '',
    sex: '',
    language: 'en'
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.age || !formData.sex) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting form data:", formData);
    onSubmit(formData);
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min="0"
          max="120"
          required
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sex">Sex</Label>
        <Select
          value={formData.sex}
          onValueChange={(value) => setFormData({ ...formData, sex: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sex" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Preferred Language</Label>
        <Select
          value={formData.language}
          onValueChange={(value) => setFormData({ ...formData, language: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Analyze Report
      </Button>
    </form>
  );
};