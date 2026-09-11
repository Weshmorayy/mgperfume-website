import { Order } from '@/types';

/**
 * PayTech Senegal Payment Gateway Integration
 * Official Documentation: https://doc.intech.sn/doc_paytech.php
 */

export const PAYTECH_API_URL = 'https://paytech.sn/api/payment/request-payment';

export interface PaytechPaymentRequest {
  item_name: string;
  item_price: number;
  currency: string;
  ref_command: string;
  command_name: string;
  env: 'test' | 'prod';
  ipn_url: string;
  success_url: string;
  cancel_url: string;
  custom_field?: string;
}

export interface PaytechPaymentResponse {
  success: number; // 1 = success, -1 or 0 = failure
  token?: string;
  redirect_url?: string;
  message?: string;
  errors?: any;
}

/**
 * Generate unique order reference (e.g., MGP-20260911-A8F3)
 */
export function generateOrderReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MGP-${dateStr}-${randStr}`;
}

/**
 * Initiates payment session with PayTech SN API
 * Call this from server-side route handler or server component to keep API_SECRET secure!
 */
export async function requestPaytechPayment(
  order: Order,
  originUrl: string,
  apiKey: string,
  apiSecret: string,
  env: 'test' | 'prod' = 'test'
): Promise<{ success: boolean; redirectUrl?: string; token?: string; error?: string }> {
  try {
    if (!apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Clés API PayTech manquantes. Veuillez configurer PAYTECH_API_KEY et PAYTECH_API_SECRET.',
      };
    }

    const payload: PaytechPaymentRequest = {
      item_name: `Commande MG Perfume #${order.ref_command}`,
      item_price: Math.round(order.total_amount),
      currency: 'XOF',
      ref_command: order.ref_command,
      command_name: `Commande MG Perfume #${order.ref_command} (${order.customer_name})`,
      env: env,
      ipn_url: `${originUrl}/api/paytech/ipn`,
      success_url: `${originUrl}/commande-confirmee?ref=${order.ref_command}&status=success`,
      cancel_url: `${originUrl}/?cart=open&ref=${order.ref_command}&status=cancelled`,
      custom_field: JSON.stringify({
        order_id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        total_amount: order.total_amount,
      }),
    };

    const response = await fetch(PAYTECH_API_URL, {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'API_SECRET': apiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: PaytechPaymentResponse = await response.json();

    if (data.success === 1 && data.redirect_url) {
      return {
        success: true,
        redirectUrl: data.redirect_url,
        token: data.token,
      };
    }

    return {
      success: false,
      error: data.message || 'La passerelle PayTech n’a pas pu valider la demande.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erreur réseau lors de la communication avec PayTech',
    };
  }
}
