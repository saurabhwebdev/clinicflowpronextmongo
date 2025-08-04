import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  scale?: number;
}

export const generatePDFFromElement = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<jsPDF> => {
  const {
    filename = 'document.pdf',
    format = 'a4',
    orientation = 'portrait',
    margin = 10, // Reduced margin for more content space
    scale = 2
  } = options;

  try {
    // Optimize the element for PDF generation - this returns a clone
    const clone = optimizeElementForPDF(elementId);
    const elementToUse = clone || document.getElementById(elementId);
    
    if (!elementToUse) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Configure html2canvas options with improved settings
    const canvas = await html2canvas(elementToUse, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: elementToUse.scrollWidth,
      height: elementToUse.scrollHeight,
      onclone: (clonedDoc, element) => {
        // Additional optimizations on the cloned document
        element.style.width = '210mm';
        element.style.margin = '0';
        element.style.padding = '0';
        
        // Force tables to have proper width
        const tables = element.querySelectorAll('table');
        tables.forEach(table => {
          table.style.width = '100%';
          table.style.tableLayout = 'fixed';
        });
      }
    });

    // Get canvas dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF with proper settings
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format,
      compress: true,
      hotfixes: ['px_scaling']
    });

    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling to fit content with margins
    const availableWidth = pdfWidth - (margin * 2);
    
    // Calculate the ratio to fit the content width
    const widthRatio = availableWidth / (imgWidth * 0.264583); // Convert px to mm
    
    // Calculate final dimensions - maintain aspect ratio
    const finalWidth = availableWidth;
    const finalHeight = (imgHeight * widthRatio * 0.264583);
    
    // If content is taller than page, split into multiple pages
    if (finalHeight > (pdfHeight - margin * 2)) {
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate how many pages we need
      const pageHeight = pdfHeight - margin * 2;
      const contentHeight = finalHeight;
      const pageCount = Math.ceil(contentHeight / pageHeight);
      
      // For each page
      for (let i = 0; i < pageCount; i++) {
        // Add new page if not the first page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate position to slice the image
        const sourceY = i * pageHeight / finalHeight * imgHeight;
        const sourceHeight = Math.min(imgHeight - sourceY, pageHeight / finalHeight * imgHeight);
        
        // Add portion of the image to the page
        pdf.addImage(
          imgData, 
          'PNG', 
          margin, 
          margin, 
          finalWidth, 
          finalHeight, 
          undefined, 
          'FAST',
          i === 0 ? 0 : -sourceY * finalHeight / imgHeight
        );
      }
    } else {
      // Content fits on one page
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight);
    }

    // Clean up
    if (clone) {
      restoreElementAfterPDF(elementId);
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadPDF = async (
  elementId: string,
  filename: string,
  options: PDFOptions = {}
): Promise<void> => {
  try {
    const pdf = await generatePDFFromElement(elementId, { ...options, filename });
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const printPDF = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<void> => {
  try {
    const pdf = await generatePDFFromElement(elementId, options);
    
    // Create blob URL for printing
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new window for printing
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      };
    } else {
      // Fallback: download if popup blocked
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'bill.pdf';
      link.click();
      URL.revokeObjectURL(blobUrl);
    }
  } catch (error) {
    console.error('Error printing PDF:', error);
    throw error;
  }
};

export const previewPDF = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<string> => {
  try {
    const pdf = await generatePDFFromElement(elementId, options);
    const pdfBlob = pdf.output('blob');
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw error;
  }
};

// Utility function to optimize element for PDF generation
export const optimizeElementForPDF = (elementId: string): HTMLElement | null => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  // Create a clone of the element to avoid affecting the visible element
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = `${elementId}-clone`;
  document.body.appendChild(clone);
  
  // Add PDF-specific styles to the clone
  clone.style.width = '210mm'; // A4 width
  clone.style.minHeight = '297mm'; // A4 height (minimum)
  clone.style.padding = '15mm'; // Slightly reduced padding for more content space
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  clone.style.zIndex = '-1000';
  
  // Ensure all tables have proper width
  const tables = clone.querySelectorAll('table');
  tables.forEach(table => {
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';
  });
  
  // Ensure all images are loaded and properly sized
  const images = clone.querySelectorAll('img');
  images.forEach(img => {
    if (!img.complete) {
      img.style.display = 'none';
    } else {
      // Ensure images don't exceed reasonable size
      img.style.maxWidth = '100%';
      img.style.maxHeight = '50mm';
    }
  });
  
  return clone;
};

// Utility to restore element after PDF generation
export const restoreElementAfterPDF = (elementId: string): void => {
  // Remove the clone if it exists
  const clone = document.getElementById(`${elementId}-clone`);
  if (clone) {
    document.body.removeChild(clone);
  }
  
  // Ensure original element is restored if needed
  const element = document.getElementById(elementId);
  if (!element) return;

  // Remove any PDF-specific styles that might have been applied
  element.style.width = '';
  element.style.minHeight = '';
  element.style.padding = '';
  element.style.margin = '';
  element.style.boxSizing = '';
  element.style.backgroundColor = '';
  element.style.color = '';
  
  // Restore images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    img.style.display = '';
    img.style.maxWidth = '';
    img.style.maxHeight = '';
  });
  
  // Restore tables
  const tables = element.querySelectorAll('table');
  tables.forEach(table => {
    table.style.width = '';
    table.style.tableLayout = '';
  });
};