import { format } from "date-fns";
import { toast } from "sonner";

export function useInvoiceShare(invoice: any) {
  const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
  const fileName = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;

  const getShareText = () => {
    const fullUrl = `${window.location.origin}/invoices/${invoice.id}`;
    const pdfFullUrl = `${window.location.origin}${pdfUrl}`;
    const dueDate = invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A';

    return {
      fullUrl,
      pdfFullUrl,
      text: `Invoice ${invoice.invoiceNumber} | ${invoice.client.name} | ${invoice.currency} ${invoice.total}`,
      emailBody: `Hi ${invoice.client.name},\n\nPlease find your invoice below.\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.currency} ${invoice.total}\nDue Date: ${dueDate}\n\nDownload PDF: ${pdfFullUrl}\nView invoice: ${fullUrl}\n\nThank you.`
    };
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const sharePdfFile = async () => {
    if (!('share' in navigator)) return false;

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to prepare PDF');

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const shareData = {
        title: `Invoice ${invoice.invoiceNumber}`,
        text: `Invoice ${invoice.invoiceNumber}`,
        files: [file],
      };
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData & { files?: File[] }) => boolean;
      };

      if (nav.canShare?.(shareData) === false) return false;
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Could not share the PDF file directly');
      }
      return true;
    }
  };

  const handleShare = async (option: string) => {
    const { fullUrl, pdfFullUrl, text, emailBody } = getShareText();

    switch (option) {
      case 'whatsapp':
        if (await sharePdfFile()) break;
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\nDownload PDF: ${pdfFullUrl}\n${fullUrl}`)}`, '_blank');
        break;
      case 'gmail':
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(invoice.client.email || '')}&su=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(emailBody)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${invoice.client.email || ''}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(emailBody)}`, '_blank');
        break;
      case 'native':
        if (!(await sharePdfFile())) {
          await navigator.clipboard.writeText(pdfFullUrl);
          toast.success('PDF link copied');
        }
        break;
    }
  };

  return { downloadPdf, handleShare };
}
