'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileDown, FileType } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';

export function DownloadReport({ reportContent }: { reportContent: string }) {

  const handleDownloadPdf = async () => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.innerHTML = reportContent;
    document.body.appendChild(tempContainer);
  
    const canvas = await html2canvas(tempContainer.querySelector('#report-content') as HTMLElement, { scale: 2 });
    document.body.removeChild(tempContainer);
  
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const widthInPdf = pdfWidth - 20;
    const heightInPdf = widthInPdf / ratio;
  
    let heightLeft = heightInPdf;
    let position = 10;
  
    pdf.addImage(imgData, 'PNG', 10, position, widthInPdf, heightInPdf);
    heightLeft -= pdfHeight;
  
    while (heightLeft > 0) {
      position = heightLeft - heightInPdf;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, widthInPdf, heightInPdf);
      heightLeft -= pdfHeight;
    }
  
    pdf.save('diagnostic-report.pdf');
  };

  const handleDownloadWord = async () => {
    const docxBlob = await htmlToDocx(reportContent, undefined, {
      font: 'Arial',
      fontSize: 12,
    });
    saveAs(docxBlob, 'diagnostic-report.docx');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPdf}>
          <FileDown className="mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadWord}>
          <FileType className="mr-2" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
