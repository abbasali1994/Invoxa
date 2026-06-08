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
          <Text style={styles.paymentTitle}>INVOICE ADDRESS:</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <View style={styles.paymentValue}>
              <Text>{data.paymentMethod || '[method]'}</Text>
              {data.bankAccountName ? <Text>Bank Account Name: {data.bankAccountName}</Text> : null}
              {data.bankName ? <Text>Bank Name: {data.bankName}</Text> : null}
              {data.accountNumber ? <Text>Account number: {data.accountNumber}</Text> : null}
              {data.ifscCode ? <Text>IFSC code: {data.ifscCode}</Text> : null}
              {data.swiftCode ? <Text>SWIFT code: {data.swiftCode}</Text> : null}
            </View>
          </View>
        </View>
        
      </Page>
    </Document>
  );
};
