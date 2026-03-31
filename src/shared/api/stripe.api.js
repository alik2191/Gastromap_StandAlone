/**
 * Stripe Payment Stub Implementation
 * 
 * This is a MOCK/STUB for development and testing.
 * Replace with real Stripe integration in production.
 * 
 * Real Stripe integration requires:
 * - Stripe account
 * - API keys (publishable + secret)
 * - Backend functions for payment intents
 * - Webhook handlers
 */

import { supabase } from './client'

// Mock Stripe configuration
const STRIPE_CONFIG = {
    enabled: true,
    mode: 'test', // 'test' or 'live'
    publishableKey: 'pk_test_MOCK_KEY_FOR_DEVELOPMENT',
    currency: 'PLN',
    supportedMethods: ['card', 'blik', 'p24'],
    testCards: {
        success: '4242424242424242',
        decline: '4000000000000002',
        blik: '123456'
    }
}

// Mock products/prices
const MOCK_PRODUCTS = [
    {
        id: 'prod_premium_monthly',
        name: 'GastroMap Premium',
        description: 'Premium subscription with AI features',
        price: 2999, // in cents/gr groszy
        currency: 'PLN',
        interval: 'month',
        features: [
            'Unlimited AI queries',
            'Advanced filters',
            'Offline mode',
            'Priority support'
        ]
    },
    {
        id: 'prod_premium_yearly',
        name: 'GastroMap Premium (Yearly)',
        description: 'Annual subscription with 20% discount',
        price: 28790, // in cents/gr groszy
        currency: 'PLN',
        interval: 'year',
        features: [
            'All Premium features',
            '2 months free',
            'Early access to new features'
        ]
    }
]

/**
 * Initialize Stripe (stub)
 */
export async function initializeStripe() {
    console.log('[Stripe Stub] Initializing with config:', STRIPE_CONFIG)
    return {
        enabled: STRIPE_CONFIG.enabled,
        mode: STRIPE_CONFIG.mode,
        publishableKey: STRIPE_CONFIG.publishableKey
    }
}

/**
 * Create payment intent (stub)
 * @param {Object} params - Payment parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.userId - User ID
 * @param {string} params.email - User email
 * @returns {Promise<Object>} Payment intent response
 */
export async function createPaymentIntent({ productId, userId, email }) {
    console.log('[Stripe Stub] Creating payment intent:', { productId, userId, email })
    
    // Find product
    const product = MOCK_PRODUCTS.find(p => p.id === productId)
    if (!product) {
        throw new Error('Product not found')
    }
    
    // Mock payment intent
    const paymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `secret_mock_${Date.now()}`,
        amount: product.price,
        currency: product.currency,
        status: 'requires_payment_method',
        product: product,
        created: Date.now(),
        metadata: {
            userId,
            email,
            productId
        }
    }
    
    console.log('[Stripe Stub] Payment intent created:', paymentIntent)
    return paymentIntent
}

/**
 * Confirm payment (stub)
 * @param {string} paymentIntentId - Payment intent ID
 * @param {Object} paymentMethod - Payment method details
 * @returns {Promise<Object>} Payment confirmation
 */
export async function confirmPayment(paymentIntentId, paymentMethod) {
    console.log('[Stripe Stub] Confirming payment:', { paymentIntentId, paymentMethod })
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock success (in real implementation, this would call Stripe API)
    const isSuccess = paymentMethod?.card?.number === STRIPE_CONFIG.testCards.success ||
                     paymentMethod?.blik === STRIPE_CONFIG.testCards.blik
    
    if (isSuccess) {
        const confirmation = {
            payment_intent: paymentIntentId,
            status: 'succeeded',
            amount: 2999,
            currency: 'PLN',
            paid: true,
            receipt_url: `https://mock.stripe.com/receipts/${paymentIntentId}`,
            created: Date.now()
        }
        
        console.log('[Stripe Stub] Payment confirmed:', confirmation)
        
        // Save to database
        await savePaymentRecord(confirmation)
        
        return confirmation
    } else {
        throw new Error('Payment declined (mock)')
    }
}

/**
 * Create checkout session (stub)
 * @param {Object} params - Checkout parameters
 * @returns {Promise<Object>} Checkout session
 */
export async function createCheckoutSession({ productId, userId, email, successUrl, cancelUrl }) {
    console.log('[Stripe Stub] Creating checkout session:', { productId, userId, email })
    
    const product = MOCK_PRODUCTS.find(p => p.id === productId)
    if (!product) {
        throw new Error('Product not found')
    }
    
    const session = {
        id: `cs_mock_${Date.now()}`,
        url: `https://mock.stripe.com/checkout/${Date.now()}`,
        status: 'open',
        amount: product.price,
        currency: product.currency,
        product: product,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
            email,
            productId
        },
        expires_at: Date.now() + 3600000 // 1 hour
    }
    
    console.log('[Stripe Stub] Checkout session created:', session)
    return session
}

/**
 * Get available products
 * @returns {Array} List of products
 */
export function getProducts() {
    console.log('[Stripe Stub] Getting products')
    return MOCK_PRODUCTS
}

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Object|null} Product details
 */
export function getProduct(productId) {
    console.log('[Stripe Stub] Getting product:', productId)
    return MOCK_PRODUCTS.find(p => p.id === productId) || null
}

/**
 * Save payment record to database
 * @param {Object} paymentData - Payment data
 */
async function savePaymentRecord(paymentData) {
    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                stripe_payment_intent_id: paymentData.payment_intent,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: paymentData.status,
                receipt_url: paymentData.receipt_url,
                created_at: new Date().toISOString()
            }])
        
        if (error) {
            console.error('[Stripe Stub] Error saving payment:', error)
        } else {
            console.log('[Stripe Stub] Payment saved to database:', data)
        }
    } catch (error) {
        console.error('[Stripe Stub] Exception saving payment:', error)
    }
}

/**
 * Handle webhook (stub)
 * @param {string} signature - Webhook signature
 * @param {Object} event - Webhook event
 * @returns {Object} Processed event
 */
export async function handleWebhook(signature, event) {
    console.log('[Stripe Stub] Handling webhook:', { signature, event })
    
    // In real implementation, this would verify signature and process event
    return {
        received: true,
        type: event?.type || 'mock.event',
        processed: true
    }
}

/**
 * Check if Stripe is enabled
 * @returns {boolean}
 */
export function isStripeEnabled() {
    return STRIPE_CONFIG.enabled
}

/**
 * Get Stripe configuration
 * @returns {Object} Stripe config
 */
export function getStripeConfig() {
    return { ...STRIPE_CONFIG }
}

export default {
    initializeStripe,
    createPaymentIntent,
    confirmPayment,
    createCheckoutSession,
    getProducts,
    getProduct,
    handleWebhook,
    isStripeEnabled,
    getStripeConfig
}
