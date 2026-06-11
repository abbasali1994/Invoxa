import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { expenseStyles as styles } from './ExpensePDFStyles';

export const ExpensePDFDocument = ({ expense }: { expense: any }) => {
  const lineItems = Array.isArray(expense.lineItems) ? expense.lineItems : [];

  const getSymbol = (curr: string) => {
    if (curr === 'INR') return '₹';
    if (curr === 'GBP') return '£';
    if (curr === 'EUR') return '€';
    if (curr === 'CAD') return 'C$';
    if (curr === 'CHF') return 'CHF ';
    return '$';
  };
  const sym = getSymbol(expense.currency || 'USD');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EXPENSE RECEIPT</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.companyName}>{expense.vendor || 'Vendor'}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailsLeft}>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={styles.label}>Category:</Text><Text style={styles.value}>{expense.category || 'N/A'}</Text></View>
          </View>
          <View style={styles.detailsRight}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold', marginRight: 4 }}>Date:</Text>
              <Text>{expense.date ? new Date(expense.date).toLocaleDateString('en-US') : 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold', marginRight: 4 }}>Expense No:</Text>
              <Text>{expense.expenseNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DETAILS</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colAmt}>Amount</Text>
        </View>

        {lineItems.map((item: any, i: number) => {
          if (item.isSection) {
            return (
              <View key={i} style={styles.tableRowSection}>
                <Text style={styles.sectionText}>{item.description}</Text>
              </View>
            )
          }
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colAmt}>{sym}{Number(item.amount || 0).toFixed(2)}</Text>
            </View>
          )
        })}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{sym}{Number(expense.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>TOTAL</Text>
            <Text>{sym}{Number(expense.total || expense.amount || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ ...styles.paymentSection, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>PAYMENT</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentValue}>{expense.paymentMethod || 'N/A'}</Text>
            </View>
            {(expense.notes && expense.notes.toLowerCase() !== 'none') && (
              <View style={{ ...styles.paymentRow, marginTop: 4 }}>
                <Text style={styles.paymentLabel}>Notes:</Text>
                <Text style={styles.paymentValue}>{expense.notes}</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ marginBottom: 8 }}><Text style={{ fontWeight: 'bold' }}>Payment By</Text> - Quantek Solutions</Text>
            <View style={styles.paymentRow}>
              <Text><Text style={{ fontWeight: 'bold' }}>GST NO</Text> - 23AJYPL0580D1Z6</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

