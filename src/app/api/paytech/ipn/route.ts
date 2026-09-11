import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * PayTech Instant Payment Notification (IPN) Webhook Handler
 * Documentation: https://doc.intech.sn/doc_paytech.php
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (_) {
      // Sometimes PayTech sends form-urlencoded
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    const {
      type_event,
      ref_command,
      item_price,
      custom_field,
      api_key_sha256,
      api_secret_sha256,
    } = body;

    const apiSecret = process.env.PAYTECH_API_SECRET || '';
    const apiKey = process.env.PAYTECH_API_KEY || '';

    // Sécurité : Si les clés sont configurées, vérifier le hash SHA256 si fourni par PayTech
    if (apiSecret && api_secret_sha256) {
      const computedSecretHash = crypto.createHash('sha256').update(apiSecret).digest('hex');
      if (computedSecretHash !== api_secret_sha256) {
        console.error('IPN PayTech: Hash secret invalide');
        return NextResponse.json({ success: 0, error: 'Signature invalide' }, { status: 403 });
      }
    }

    if (!ref_command) {
      return NextResponse.json({ success: 0, error: 'ref_command manquant' }, { status: 400 });
    }

    // Mettre à jour la commande dans Supabase
    if (supabaseAdmin) {
      const isSuccess = type_event === 'transfer_success' || type_event === 'sale_complete' || !type_event;

      const updatePayload = {
        payment_status: isSuccess ? 'paid' : 'failed',
        order_status: isSuccess ? 'processing' : 'cancelled',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from('orders')
        .update(updatePayload)
        .eq('ref_command', ref_command);

      if (error) {
        console.error('Erreur Supabase mise à jour IPN:', error.message);
      }
    }

    // Réponse HTTP 200 obligatoire pour acquitter l'IPN auprès de PayTech
    return NextResponse.json({ success: 1, message: 'IPN traité avec succès' }, { status: 200 });
  } catch (err: any) {
    console.error('Erreur traitement IPN PayTech:', err);
    return NextResponse.json({ success: 0, error: err.message }, { status: 500 });
  }
}
