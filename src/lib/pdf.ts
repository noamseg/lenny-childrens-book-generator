import { Book } from '@/types';

// Note: This is a simplified PDF generation utility
// For production, you'd use @react-pdf/renderer with proper styling
// or a server-side library like puppeteer or jspdf

export interface PdfOptions {
  pageSize?: 'letter' | 'a4' | 'square';
  orientation?: 'portrait' | 'landscape';
  includeCredits?: boolean;
}

const DEFAULT_OPTIONS: PdfOptions = {
  pageSize: 'square',
  orientation: 'portrait',
  includeCredits: true,
};

export async function generateBookPdf(
  book: Book,
  options: PdfOptions = {}
): Promise<Blob> {
  const { includeCredits } = { ...DEFAULT_OPTIONS, ...options };

  // For the MVP, we'll create a simple HTML-based PDF approach
  // This can be enhanced with @react-pdf/renderer for production

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${book.childName}'s Adventure</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Georgia, serif; }
        .page {
          width: 8.5in;
          height: 8.5in;
          padding: 0.5in;
          page-break-after: always;
          display: flex;
          flex-direction: column;
        }
        .cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(135deg, #fef3f2, #f0fdf4);
        }
        .cover h1 {
          font-size: 48px;
          color: #333;
          margin-bottom: 20px;
        }
        .cover p {
          font-size: 24px;
          color: #666;
        }
        .content-page {
          position: relative;
        }
        .illustration {
          width: 100%;
          height: 60%;
          object-fit: cover;
          border-radius: 16px;
        }
        .text {
          padding: 24px;
          font-size: 24px;
          line-height: 1.6;
          color: #333;
        }
        .page-number {
          position: absolute;
          bottom: 0.25in;
          right: 0.25in;
          font-size: 14px;
          color: #999;
        }
        .credits {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #f9fafb;
        }
        .credits p {
          font-size: 16px;
          color: #666;
          margin: 8px 0;
        }
        @media print {
          .page { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <!-- Cover Page -->
      <div class="page cover">
        <h1>${book.childName}'s Adventure</h1>
        <p>A personalized children's book</p>
      </div>

      <!-- Content Pages -->
      ${book.pages
        .map(
          (page) => `
        <div class="page content-page">
          ${
            page.imageUrl
              ? `<img class="illustration" src="${page.imageUrl}" alt="Page ${page.pageNumber} illustration" />`
              : '<div class="illustration" style="background: #f0f0f0;"></div>'
          }
          <div class="text">
            ${page.text.replace(/\[CHILD_NAME\]/g, book.childName)}
          </div>
          <div class="page-number">${page.pageNumber}</div>
        </div>
      `
        )
        .join('')}

      ${
        includeCredits
          ? `
        <!-- Credits Page -->
        <div class="page credits">
          <p>Created with Lenny's Children's Book Generator</p>
          <p>Made with love for ${book.childName}</p>
          <p>${new Date(book.createdAt).toLocaleDateString()}</p>
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;

  // Convert HTML to Blob
  // In production, this would use puppeteer or similar to generate actual PDF
  const blob = new Blob([htmlContent], { type: 'text/html' });

  return blob;
}

// Helper to trigger download on client
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
