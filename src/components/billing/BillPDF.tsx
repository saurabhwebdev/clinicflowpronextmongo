'use client';

import React from 'react';
import { format } from 'date-fns';

interface BillPDFProps {
  bill: any;
  clinicSettings: any;
  formatCurrency: (amount: number) => string;
}

export const BillPDF: React.FC<BillPDFProps> = ({ 
  bill, 
  clinicSettings, 
  formatCurrency 
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      paid: { bg: '#34c759', text: '#ffffff' },
      sent: { bg: '#007aff', text: '#ffffff' },
      overdue: { bg: '#ff3b30', text: '#ffffff' },
      draft: { bg: '#8e8e93', text: '#ffffff' },
      cancelled: { bg: '#ff3b30', text: '#ffffff' }
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  // Use clinic settings colors with fallbacks
  const primaryColor = clinicSettings?.primaryColor || '#007aff';
  const secondaryColor = clinicSettings?.secondaryColor || '#1e40af';
  const accentColor = clinicSettings?.accentColor || '#34c759';
  const backgroundColor = clinicSettings?.backgroundColor || '#ffffff';
  const textColor = clinicSettings?.textColor || '#1d1d1f';

  return (
    <div 
      id="bill-pdf-content"
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        color: textColor,
        backgroundColor: backgroundColor,
        width: '100%',
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '20px',
        fontSize: '12px',
        lineHeight: '1.4',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #e5e5e7',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          {/* Clinic Info */}
          <div style={{ flex: '1' }}>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: '600',
              color: primaryColor,
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px'
            }}>
              {clinicSettings?.clinicName || 'Medical Clinic'}
            </h1>
            <div style={{ fontSize: '11px', color: '#86868b', lineHeight: '1.4' }}>
              {clinicSettings?.clinicAddress && (
                <div style={{ marginBottom: '2px' }}>{clinicSettings.clinicAddress}</div>
              )}
              {clinicSettings?.clinicPhone && (
                <div style={{ marginBottom: '2px' }}>Phone: {clinicSettings.clinicPhone}</div>
              )}
              {clinicSettings?.clinicEmail && (
                <div style={{ marginBottom: '2px' }}>Email: {clinicSettings.clinicEmail}</div>
              )}
              {clinicSettings?.clinicWebsite && (
                <div style={{ marginBottom: '2px' }}>Website: {clinicSettings.clinicWebsite}</div>
              )}
              {clinicSettings?.licenseNumber && (
                <div style={{ marginBottom: '2px' }}>License: {clinicSettings.licenseNumber}</div>
              )}
              {clinicSettings?.establishedYear && (
                <div style={{ marginBottom: '2px' }}>Est. {clinicSettings.establishedYear}</div>
              )}
            </div>
            
            {/* Social Media Links */}
            {clinicSettings?.socialMedia && (
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#86868b' }}>
                {clinicSettings.socialMedia.facebook && (
                  <span style={{ marginRight: '8px' }}>Facebook</span>
                )}
                {clinicSettings.socialMedia.twitter && (
                  <span style={{ marginRight: '8px' }}>Twitter</span>
                )}
                {clinicSettings.socialMedia.instagram && (
                  <span style={{ marginRight: '8px' }}>Instagram</span>
                )}
                {clinicSettings.socialMedia.linkedin && (
                  <span style={{ marginRight: '8px' }}>LinkedIn</span>
                )}
                {clinicSettings.socialMedia.youtube && (
                  <span style={{ marginRight: '8px' }}>YouTube</span>
                )}
              </div>
            )}
            
            {/* Specializations */}
            {clinicSettings?.specializations && clinicSettings.specializations.length > 0 && (
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#86868b' }}>
                <span style={{ fontWeight: '500' }}>Specializations:</span> {clinicSettings.specializations.join(', ')}
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              backgroundColor: '#f5f5f7',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <h2 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: textColor,
                margin: '0 0 12px 0'
              }}>
                INVOICE
              </h2>
              <div style={{ fontSize: '11px', color: '#86868b' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500' }}>Bill #:</span> {bill.billNumber}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500' }}>Date:</span> {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500' }}>Due:</span> {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                </div>
                <div style={{ 
                  display: 'inline-block',
                  backgroundColor: getStatusColor(bill.status).bg,
                  color: getStatusColor(bill.status).text,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {bill.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ flex: '1', marginRight: '24px' }}>
          <h3 style={{ 
            fontSize: '14px',
            fontWeight: '600',
            color: secondaryColor,
            margin: '0 0 8px 0'
          }}>
            Bill To
          </h3>
          <div style={{ fontSize: '12px', color: textColor, lineHeight: '1.4' }}>
            <div style={{ 
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              {bill.patientId?.firstName || 'Unknown'} {bill.patientId?.lastName || 'Patient'}
            </div>
            <div style={{ color: '#86868b', marginBottom: '2px' }}>
              {bill.patientId?.email || 'No email'}
            </div>
            {bill.patientId?.phone && (
              <div style={{ color: '#86868b', marginBottom: '2px' }}>
                {bill.patientId.phone}
              </div>
            )}
            {bill.patientId?.address && (
              <div style={{ color: '#86868b' }}>
                {bill.patientId.address}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Info */}
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            fontSize: '14px',
            fontWeight: '600',
            color: secondaryColor,
            margin: '0 0 8px 0'
          }}>
            Appointment Details
          </h3>
          <div style={{ fontSize: '12px', color: textColor, lineHeight: '1.4' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#86868b' }}>Doctor:</span> Dr. {bill.doctorId?.firstName || 'Unknown'} {bill.doctorId?.lastName || 'Doctor'}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#86868b' }}>Date:</span> {bill.appointmentId?.dateTime ? 
                format(new Date(bill.appointmentId.dateTime), 'MMMM dd, yyyy \'at\' h:mm a') : 
                'No date available'
              }
            </div>
            {bill.appointmentId?.notes && (
              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f7', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#86868b', marginBottom: '2px' }}>Notes:</div>
                <div style={{ fontSize: '11px', color: textColor }}>{bill.appointmentId.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '14px',
          fontWeight: '600',
          color: secondaryColor,
          margin: '0 0 12px 0'
        }}>
          Services & Items
        </h3>
        
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #e5e5e7',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f7' }}>
              <th style={{ 
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '600',
                color: textColor,
                borderBottom: '1px solid #e5e5e7'
              }}>
                Description
              </th>
              <th style={{ 
                padding: '10px 12px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '600',
                color: textColor,
                borderBottom: '1px solid #e5e5e7',
                width: '60px'
              }}>
                Qty
              </th>
              <th style={{ 
                padding: '10px 12px',
                textAlign: 'right',
                fontSize: '11px',
                fontWeight: '600',
                color: textColor,
                borderBottom: '1px solid #e5e5e7',
                width: '80px'
              }}>
                Unit Price
              </th>
              <th style={{ 
                padding: '10px 12px',
                textAlign: 'right',
                fontSize: '11px',
                fontWeight: '600',
                color: textColor,
                borderBottom: '1px solid #e5e5e7',
                width: '80px'
              }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item: any, index: number) => (
              <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                borderBottom: '1px solid #e5e5e7'
              }}>
                <td style={{ 
                  padding: '10px 12px',
                  fontSize: '11px',
                  color: textColor
                }}>
                  {item.description}
                </td>
                <td style={{ 
                  padding: '10px 12px',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: textColor
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontSize: '11px',
                  color: '#86868b'
                }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td style={{ 
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: textColor
                }}>
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <div style={{ 
          width: '280px',
          backgroundColor: '#f5f5f7',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ 
                  padding: '4px 0',
                  fontSize: '11px',
                  color: '#86868b'
                }}>
                  Subtotal:
                </td>
                <td style={{ 
                  padding: '4px 0',
                  textAlign: 'right',
                  fontSize: '11px',
                  color: textColor
                }}>
                  {formatCurrency(bill.subtotal)}
                </td>
              </tr>
              {bill.tax > 0 && (
                <tr>
                  <td style={{ 
                    padding: '4px 0',
                    fontSize: '11px',
                    color: '#86868b'
                  }}>
                    Tax:
                  </td>
                  <td style={{ 
                    padding: '4px 0',
                    textAlign: 'right',
                    fontSize: '11px',
                    color: textColor
                  }}>
                    {formatCurrency(bill.tax)}
                  </td>
                </tr>
              )}
              {bill.discount > 0 && (
                <tr>
                  <td style={{ 
                    padding: '4px 0',
                    fontSize: '11px',
                    color: '#86868b'
                  }}>
                    Discount:
                  </td>
                  <td style={{ 
                    padding: '4px 0',
                    textAlign: 'right',
                    fontSize: '11px',
                    color: '#ff3b30'
                  }}>
                    -{formatCurrency(bill.discount)}
                  </td>
                </tr>
              )}
              <tr style={{ borderTop: '1px solid #e5e5e7' }}>
                <td style={{ 
                  padding: '8px 0 4px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: textColor
                }}>
                  Total Amount:
                </td>
                <td style={{ 
                  padding: '8px 0 4px 0',
                  textAlign: 'right',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: accentColor
                }}>
                  {formatCurrency(bill.totalAmount)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ 
                  padding: '2px 0',
                  textAlign: 'right',
                  fontSize: '10px',
                  color: '#86868b'
                }}>
                  {bill.status === 'paid' ? '✓ Payment Received' : 'Amount Due'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Information */}
      {bill.status === 'paid' && bill.paymentMethod && (
        <div style={{ 
          backgroundColor: '#f0f8ff',
          border: '1px solid #007aff',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '12px',
            fontWeight: '600',
            color: '#007aff',
            margin: '0 0 8px 0'
          }}>
            ✓ Payment Information
          </h3>
          <div style={{ fontSize: '11px', color: textColor }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#86868b' }}>Method:</span> {bill.paymentMethod.replace('_', ' ').toUpperCase()}
            </div>
            {bill.paymentDate && (
              <div>
                <span style={{ color: '#86868b' }}>Date:</span> {format(new Date(bill.paymentDate), 'MMMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {bill.notes && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '14px',
            fontWeight: '600',
            color: secondaryColor,
            margin: '0 0 8px 0'
          }}>
            Additional Notes
          </h3>
          <div style={{ 
            backgroundColor: '#f5f5f7',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '11px',
            color: textColor,
            lineHeight: '1.4'
          }}>
            {bill.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid #e5e5e7',
        paddingTop: '16px',
        marginTop: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: '1', marginRight: '24px' }}>
            <h4 style={{ 
              fontSize: '12px',
              fontWeight: '600',
              color: textColor,
              margin: '0 0 6px 0'
            }}>
              Payment Instructions
            </h4>
            <p style={{ 
              fontSize: '10px',
              color: '#86868b',
              margin: '0 0 8px 0',
              lineHeight: '1.4'
            }}>
              Please make payment by the due date shown above. For questions about this invoice, please contact us.
            </p>
            {clinicSettings?.clinicDescription && (
              <p style={{ 
                fontSize: '10px',
                color: '#86868b',
                margin: '0 0 8px 0',
                lineHeight: '1.4',
                fontStyle: 'italic'
              }}>
                {clinicSettings.clinicDescription}
              </p>
            )}
            <div style={{ fontSize: '10px', color: primaryColor }}>
              {clinicSettings?.clinicEmail || bill.doctorId?.email || 'Contact clinic directly'}
            </div>
            {clinicSettings?.clinicPhone && (
              <div style={{ fontSize: '10px', color: '#86868b', marginTop: '4px' }}>
                Phone: {clinicSettings.clinicPhone}
              </div>
            )}
            {clinicSettings?.clinicAddress && (
              <div style={{ fontSize: '10px', color: '#86868b', marginTop: '2px' }}>
                {clinicSettings.clinicAddress}
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              backgroundColor: '#f5f5f7',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '10px', color: '#86868b', marginBottom: '2px' }}>
                Thank you for choosing
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>
                {clinicSettings?.clinicName || 'our clinic'}
              </div>
              {clinicSettings?.establishedYear && (
                <div style={{ fontSize: '9px', color: '#86868b', marginTop: '2px' }}>
                  Est. {clinicSettings.establishedYear}
                </div>
              )}
            </div>
            <div style={{ fontSize: '9px', color: '#86868b' }}>
              <div style={{ marginBottom: '2px' }}>Invoice #{bill.billNumber}</div>
              <div>Generated {format(new Date(), 'MMM dd, yyyy \'at\' h:mm a')}</div>
              {clinicSettings?.licenseNumber && (
                <div style={{ marginTop: '2px' }}>License: {clinicSettings.licenseNumber}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};