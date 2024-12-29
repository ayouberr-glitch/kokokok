import { Share2, Download, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareOptionsProps {
  onDownloadPDF: () => void;
  onShareLink: () => void;
  onShareEmail: () => void;
}

export const ShareOptions = ({
  onDownloadPDF,
  onShareLink,
  onShareEmail
}: ShareOptionsProps) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onDownloadPDF} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            <span>Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShareLink} className="cursor-pointer">
            <Share2 className="mr-2 h-4 w-4" />
            <span>Copy Share Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShareEmail} className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            <span>Share via Email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};