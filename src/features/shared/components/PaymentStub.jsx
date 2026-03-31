import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
    createPaymentIntent, 
    confirmPayment, 
    getProducts,
    getStripeConfig 
} from '@/shared/api/stripe.api'

/**
 * PaymentStub Component
 * 
 * Mock payment interface for testing Stripe integration.
 * Replace with real Stripe Elements in production.
 */
export function PaymentStub({ userId, userEmail, onPaymentComplete, onError }) {
    const { t, i18n } = useTranslation()
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState('idle')
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    })
    const [blikCode, setBlikCode] = useState('')
    const [error, setError] = useState(null)
    const [config, setConfig] = useState(null)

    useEffect(() => {
        // Load products
        const loadedProducts = getProducts()
        setProducts(loadedProducts)
        if (loadedProducts.length > 0) {
            setSelectedProduct(loadedProducts[0])
        }
        
        // Load Stripe config
        setConfig(getStripeConfig())
    }, [])

    const handleCardChange = (field, value) => {
        setCardDetails(prev => ({ ...prev, [field]: value }))
        setError(null)
    }

    const handlePayment = async () => {
        if (!selectedProduct) {
            setError('Please select a product')
            return
        }

        setIsProcessing(true)
        setError(null)
        setPaymentStatus('processing')

        try {
            // Create payment intent
            const paymentIntent = await createPaymentIntent({
                productId: selectedProduct.id,
                userId,
                email: userEmail
            })

            // Prepare payment method
            const paymentMethodData = paymentMethod === 'card' 
                ? { card: cardDetails }
                : { blik: blikCode }

            // Confirm payment
            const result = await confirmPayment(paymentIntent.id, paymentMethodData)

            setPaymentStatus('success')
            
            if (onPaymentComplete) {
                onPaymentComplete({
                    success: true,
                    paymentIntent: result,
                    product: selectedProduct
                })
            }
        } catch (err) {
            console.error('Payment error:', err)
            setError(err.message || 'Payment failed')
            setPaymentStatus('failed')
            
            if (onError) {
                onError({
                    success: false,
                    error: err.message
                })
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const formatPrice = (priceInCents, currency) => {
        return new Intl.NumberFormat(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
            style: 'currency',
            currency: currency
        }).format(priceInCents / 100)
    }

    return (
        <div className="payment-stub-container" style={{
            maxWidth: '500px',
            margin: '2rem auto',
            padding: '2rem',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            backgroundColor: '#fff'
        }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
                {i18n.language === 'pl' ? 'Test Płatności Stripe' : 
                 i18n.language === 'ua' ? 'Тест Платежу Stripe' : 
                 'Stripe Payment Test'}
            </h2>

            {/* Test Mode Badge */}
            {config?.mode === 'test' && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem'
                }}>
                    <strong>⚠️ TEST MODE</strong> - No real payments will be processed
                </div>
            )}

            {/* Product Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3>Select Product</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {products.map(product => (
                        <label 
                            key={product.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                border: `2px solid ${selectedProduct?.id === product.id ? '#007bff' : '#e0e0e0'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <input
                                type="radio"
                                name="product"
                                checked={selectedProduct?.id === product.id}
                                onChange={() => setSelectedProduct(product)}
                                style={{ marginRight: '1rem' }}
                            />
                            <div>
                                <div style={{ fontWeight: '600' }}>{product.name}</div>
                                <div style={{ color: '#666', fontSize: '0.875rem' }}>
                                    {product.description}
                                </div>
                                <div style={{ 
                                    color: '#007bff', 
                                    fontWeight: '600',
                                    marginTop: '0.25rem'
                                }}>
                                    {formatPrice(product.price, product.currency)}
                                    {product.interval === 'month' ? '/month' : '/year'}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3>Payment Method</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                        onClick={() => setPaymentMethod('card')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: `2px solid ${paymentMethod === 'card' ? '#007bff' : '#e0e0e0'}`,
                            borderRadius: '6px',
                            backgroundColor: paymentMethod === 'card' ? '#007bff' : '#fff',
                            color: paymentMethod === 'card' ? '#fff' : '#333',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        💳 Card
                    </button>
                    <button
                        onClick={() => setPaymentMethod('blik')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: `2px solid ${paymentMethod === 'blik' ? '#007bff' : '#e0e0e0'}`,
                            borderRadius: '6px',
                            backgroundColor: paymentMethod === 'blik' ? '#007bff' : '#fff',
                            color: paymentMethod === 'blik' ? '#fff' : '#333',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        📱 BLIK
                    </button>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input
                            type="text"
                            placeholder="Card Number (4242 4242 4242 4242)"
                            value={cardDetails.number}
                            onChange={(e) => handleCardChange('number', e.target.value)}
                            style={{
                                padding: '0.75rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '1rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => handleCardChange('expiry', e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="CVC"
                                value={cardDetails.cvc}
                                onChange={(e) => handleCardChange('cvc', e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Cardholder Name"
                            value={cardDetails.name}
                            onChange={(e) => handleCardChange('name', e.target.value)}
                            style={{
                                padding: '0.75rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '1rem'
                            }}
                        />
                        <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#666',
                            backgroundColor: '#f5f5f5',
                            padding: '0.5rem',
                            borderRadius: '4px'
                        }}>
                            <strong>Test Cards:</strong><br/>
                            ✅ Success: 4242 4242 4242 4242<br/>
                            ❌ Decline: 4000 0000 0000 0002
                        </div>
                    </div>
                )}

                {/* BLIK Code */}
                {paymentMethod === 'blik' && (
                    <div>
                        <input
                            type="text"
                            placeholder="BLIK Code (123456)"
                            value={blikCode}
                            onChange={(e) => setBlikCode(e.target.value)}
                            maxLength={6}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '1.25rem',
                                letterSpacing: '0.25rem',
                                textAlign: 'center'
                            }}
                        />
                        <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#666',
                            marginTop: '0.5rem'
                        }}>
                            Test BLIK: 123456
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    color: '#721c24',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Success Message */}
            {paymentStatus === 'success' && (
                <div style={{
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    color: '#155724',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem'
                }}>
                    ✅ Payment successful!
                </div>
            )}

            {/* Pay Button */}
            <button
                onClick={handlePayment}
                disabled={isProcessing || !selectedProduct}
                style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: isProcessing ? '#ccc' : '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing || !selectedProduct ? 0.6 : 1
                }}
            >
                {isProcessing ? 'Processing...' : `Pay ${selectedProduct ? formatPrice(selectedProduct.price, selectedProduct.currency) : ''}`}
            </button>
        </div>
    )
}

export default PaymentStub
