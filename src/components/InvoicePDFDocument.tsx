import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { invoiceStyles as styles } from './InvoicePDFStyles';
import { formatDateDDMMYYYY } from '@/lib/date-format';

export const InvoicePDFDocument = ({ data, clientName }: { data: any, clientName: string }) => {
  const lineItems = Array.isArray(data.lineItems) ? data.lineItems : [];
  const resolvedClientName = data.billToCompany || data.clientName || clientName || '[client company name]';
  const totalHours = lineItems.reduce((sum: number, item: any) => sum + (item.isSection ? 0 : (item.hours || 0)), 0);
  const totalAmount = lineItems.reduce((sum: number, item: any) => {
    if (item.isSection) return sum;
    return sum + (item.amount || 0);
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.senderName}>{data.senderName || 'Sender Name'}</Text>
          <View style={styles.metaTable}>
            <View style={[styles.metaRow, styles.metaRowTop]}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{(data.date || data.createdAt) ? formatDateDDMMYYYY(data.date || data.createdAt) : '[date]'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice #</Text>
              <Text style={[styles.metaValue, styles.metaValueBlue]}>{data.invoiceNumber || '[number]'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{data.dueDate ? formatDateDDMMYYYY(data.dueDate) : '[due date]'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.billToContainer}>
          <Text style={styles.billToTitle}>BILL TO</Text>
          <Text>Company: {resolvedClientName}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colHours}>Hours</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          
          {lineItems.map((item: any, i: number) => {
            if (item.isSection) {
              return (
                <View key={i} style={styles.tableRowSection}>
                  <Text style={styles.cellSection}>{item.description || 'Section Header Label'}</Text>
                </View>
              );
            }
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.cellDesc}>{item.description || 'Item description'}</Text>
                <Text style={styles.cellHours}>{item.hours || ''}</Text>
                <Text style={styles.cellAmount}>
                  ${(item.amount || 0).toFixed(2)}
                </Text>
              </View>
            );
          })}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalHours}>{totalHours}</Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paymentContainer}>
          <Text style={styles.paymentMethodTitle}>Payment Method:</Text>
          
          {data.paymentMethod === 'BANK_TRANSFER' || data.paymentMethod === 'Bank Transfer' ? (
            <>
              {(() => {
                let customFields = [];
                try {
                  if (Array.isArray(data.bankAccountName)) {
                    customFields = data.bankAccountName;
                  } else if (typeof data.bankAccountName === 'string') {
                    const trimmed = data.bankAccountName.trim();
                    if (trimmed.startsWith('[')) {
                      customFields = JSON.parse(trimmed);
                    }
                  }
                } catch {}

                if (customFields.length > 0) {
                  return customFields.map((f: any, idx: number) => (
                    f.key && f.value ? (
                      <View key={idx} style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailKey}>{f.key}:</Text>
                        <Text style={styles.paymentDetailVal}>{f.value}</Text>
                      </View>
                    ) : null
                  ));
                }

                // Fallback to static fields
                return (
                  <>
                    {data.bankAccountName ? (
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailKey}>Bank Account Name:</Text>
                        <Text style={styles.paymentDetailVal}>{data.bankAccountName}</Text>
                      </View>
                    ) : null}
                    {data.bankName ? (
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailKey}>Bank Name:</Text>
                        <Text style={styles.paymentDetailVal}>{data.bankName}</Text>
                      </View>
                    ) : null}
                    {data.accountNumber ? (
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailKey}>Account number:</Text>
                        <Text style={styles.paymentDetailVal}>{data.accountNumber}</Text>
                      </View>
                    ) : null}
                    {data.ifscCode ? (
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailKey}>IFSC code:</Text>
                        <Text style={styles.paymentDetailVal}>{data.ifscCode}</Text>
                      </View>
                    ) : null}
                    {data.swiftCode ? (
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailKey}>SWIFT code:</Text>
                        <Text style={styles.paymentDetailVal}>{data.swiftCode}</Text>
                      </View>
                    ) : null}
                  </>
                );
              })()}
            </>
          ) : data.paymentMethod === 'CRYPTO' || data.paymentMethod === 'Crypto' ? (
            <>
              {data.bankAccountName ? (
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailKey}>Network:</Text>
                  <Text style={styles.paymentDetailVal}>{data.bankAccountName}</Text>
                </View>
              ) : null}
              {data.accountNumber ? (
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailKey}>Wallet Address:</Text>
                  <Text style={styles.paymentDetailVal}>{data.accountNumber}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <View style={styles.paymentDetailRow}>
                <Text style={styles.paymentDetailVal}>{data.paymentMethod || '[method]'}</Text>
              </View>
              {data.instructions ? (
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailVal}>{data.instructions}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>
        
      </Page>
    </Document>
  );
};
