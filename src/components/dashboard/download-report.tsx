'use client';

import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  return (
    <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
      <Download className="mr-2" />
      Download as PDF
    </Button>
  );
}
