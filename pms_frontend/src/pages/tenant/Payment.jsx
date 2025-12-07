import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { apiCall } from "../../services/api.js";

// Token validation functions
const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    // Decode token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    return !isExpired;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    const data = await apiCall("/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    // apiCall throws error automatically if not 200, so we only check data.success
    if (data.success && data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    }

    throw new Error(data.message || "Token refresh failed");
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};


const getValidToken = async () => {
  let token = localStorage.getItem('token');
  
  // Check if token exists and is valid
  if (!token || !isValidToken(token)) {
    token = await refreshAuthToken();
  }
  
  return token;
};

// Main Payment Component with PayPal
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get payment details from navigation state
  const { leaseId, amount = 0, depositAmount = 0 } = location.state || {};
  const totalAmount = amount + depositAmount;

  // PayPal client ID - Replace with your actual PayPal client ID from developer dashboard
  const paypalClientId = "AaT_11--JY28FVeGXjAP1Ve3Cqb6GFt2SwlgYdb-gMoK1B1UHj4VpE6z6-2gtdi3SX7w0XGzpoW8ID9e";

  useEffect(() => {
    if (!leaseId) {
      alert('No lease selected for payment');
      navigate('/tenant/leases');
    }
  }, [leaseId, navigate]);

  const handlePaymentSuccess = async (paymentData) => {
  try {
    console.log("Payment successful, recording in backend...", paymentData);

    const token = await getValidToken();

    const data = await apiCall("/payments/paypal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: {
        leaseId: leaseId,
        amount: totalAmount,
        paypalOrderId: paymentData.orderID,
        paypalPayerId: paymentData.payerID,
      },
    });

    console.log("Backend response data:", data);

    if (data.success) {
      setPaymentSuccess(true);
      setTransactionDetails(paymentData);
    } else {
      console.error("Backend payment recording failed:", data.message);
      alert(`Payment succeeded but failed to record: ${data.message}`);
    }

  } catch (error) {
    console.error("Error recording payment:", error);
    alert(`Payment succeeded but recording failed: ${error.message}`);
  }
};


  const createPayPalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: `Lease Payment - First Month Rent & Security Deposit`,
          amount: {
            value: totalAmount.toFixed(2),
            currency_code: "USD",
            breakdown: {
              item_total: {
                value: totalAmount.toFixed(2),
                currency_code: "USD"
              }
            }
          },
          items: [
            {
              name: "First Month's Rent",
              description: "First month rental payment",
              quantity: "1",
              unit_amount: {
                value: amount.toFixed(2),
                currency_code: "USD"
              }
            },
            {
              name: "Security Deposit",
              description: "Refundable security deposit",
              quantity: "1",
              unit_amount: {
                value: depositAmount.toFixed(2),
                currency_code: "USD"
              }
            }
          ]
        }
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING"
      }
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      // Payment completed successfully
      handlePaymentSuccess({
        orderID: data.orderID,
        payerID: data.payerID,
        paymentID: data.paymentID,
        details: details
      });
    });
  };

  const onError = (err) => {
    console.error("PayPal Checkout onError", err);
    alert(`Payment failed: ${err.message || 'Unknown error occurred'}`);
  };

  if (!leaseId) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Invalid Payment
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>No lease selected for payment.</p>
          <button
            onClick={() => navigate('/tenant/leases')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Leases
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0070ba 0%, #005ea6 100%)',
            color: 'white',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: 0
            }}>
              Payment Successful!
            </h2>
          </div>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '36px' }}>✅</span>
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Thank You for Your Payment
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Your payment of <strong>${totalAmount.toLocaleString()}</strong> has been processed successfully via PayPal.
            </p>
            
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <h4 style={{
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                fontSize: '18px'
              }}>Payment Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Transaction ID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#1f2937' }}>
                    {transactionDetails?.orderID?.slice(-8) || 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Amount Paid:</span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Payment Method:</span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>
                    PayPal
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Status:</span>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Completed
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Date:</span>
                  <span style={{ color: '#1f2937' }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => navigate('/tenant/leases')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0070ba',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '200px'
                }}
              >
                View My Leases
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#0070ba',
                  border: '1px solid #0070ba',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '200px'
                }}
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Secure Payment
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Complete your lease agreement with secure PayPal payment
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Left Column - Payment Summary and Test Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Payment Summary */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0070ba 0%, #005ea6 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  Payment Summary
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0'
                  }}>
                    <span style={{ color: '#6b7280' }}>First Month's Rent:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0'
                  }}>
                    <span style={{ color: '#6b7280' }}>Security Deposit:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      ${depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    margin: '16px 0'
                  }}></div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0'
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                      Total Amount:
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0070ba' }}>
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: '24px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🛡️</span>
                    Secure Payment
                  </h4>
                  <p style={{
                    color: '#374151',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Your payment is processed securely through PayPal. We never store your financial details.
                  </p>
                </div>
              </div>
            </div>

            {/* PayPal Sandbox Info */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffc439 0%, #f2b600 100%)',
                color: '#1f2937',
                padding: '24px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  PayPal Sandbox Mode
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  Use these test credentials for payment:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>👤</span>
                    <div>
                      <strong style={{ color: '#1f2937', display: 'block', marginBottom: '4px' }}>
                        Personal Account (Buyer)
                      </strong>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        Email: sb-abcdef123456@personal.example.com<br />
                        Password: 123456789
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '16px' }}>💳</span>
                    <div>
                      <strong style={{ color: '#1f2937', display: 'block', marginBottom: '4px' }}>
                        Test Credit Card
                      </strong>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        Card: 4032035379773515<br />
                        Exp: 01/2026, CVV: 123
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <p style={{
                    color: '#92400e',
                    fontSize: '12px',
                    margin: 0,
                    textAlign: 'center'
                  }}>
                    💡 <strong>Note:</strong> This is a sandbox environment. No real money will be charged.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - PayPal Payment Button */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0070ba 0%, #005ea6 100%)',
                color: 'white',
                padding: '24px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  Payment Method
                </h2>
              </div>
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '8px'
                  }}>
                    Pay with PayPal
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '16px',
                    marginBottom: '0'
                  }}>
                    Total Amount: <strong>${totalAmount.toFixed(2)}</strong>
                  </p>
                </div>

                <PayPalScriptProvider 
                  options={{ 
                    "client-id": paypalClientId,
                    currency: "USD",
                    intent: "capture"
                  }}
                >
                  <PayPalButtons
                    style={{ 
                      layout: "vertical",
                      shape: "rect",
                      color: "blue",
                      label: "paypal"
                    }}
                    createOrder={createPayPalOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                </PayPalScriptProvider>

                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span>🔒</span>
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;