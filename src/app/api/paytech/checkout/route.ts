import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requestPaytechPayment } from '@/lib/paytech';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order: Order = body.order;

    if (!order || !order.customer_name || !order.customer_phone || !order.items || order.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Informations de commande incomplètes (nom, téléphone ou articles manquants).' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAYTECH_API_KEY || '';
    const apiSecret = process.env.PAYTECH_API_SECRET || '';
    const env = (process.env.PAYTECH_ENV as 'test' | 'prod') || 'test';

    // 1. Enregistrer la commande dans Supabase (table 'orders')
    if (supabaseAdmin) {
      const dbOrder = {
        id: order.id,
        ref_command: order.ref_command,
        customer_name: order.customer_name.trim(),
        customer_phone: order.customer_phone.trim(),
        customer_address: order.customer_address.trim(),
        shipping_zone_id: order.shipping_zone_id,
        shipping_zone_name: order.shipping_zone_name,
        shipping_cost: order.shipping_cost,
        subtotal: order.subtotal,
        total_amount: order.total_amount,
        items: order.items,
        payment_method: 'paytech',
        payment_status: 'pending',
        order_status: 'new',
        notes: order.notes || '',
      };

      const { error: dbError } = await supabaseAdmin.from('orders').upsert(dbOrder, { onConflict: 'id' });
      if (dbError) {
        console.warn('Erreur Supabase lors de la sauvegarde de la commande:', dbError.message);
      }
    }

    // Déterminer l'URL de base pour les redirections
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mg-perfume.com';

    // 2. Si les clés PayTech sont configurées, appeler la passerelle officielle
    if (apiKey && apiSecret) {
      const paytechRes = await requestPaytechPayment(order, origin, apiKey, apiSecret, env);

      if (paytechRes.success && paytechRes.redirectUrl) {
        // Mettre à jour le token PayTech dans Supabase
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('orders')
            .update({
              paytech_token: paytechRes.token,
              paytech_redirect_url: paytechRes.redirectUrl,
            })
            .eq('id', order.id);
        }

        return NextResponse.json({
          success: true,
          redirectUrl: paytechRes.redirectUrl,
          ref_command: order.ref_command,
        });
      }

      return NextResponse.json(
        { success: false, error: paytechRes.error || 'Erreur PayTech' },
        { status: 502 }
      );
    }

    // 3. Mode Simulation / Sandbox si clés non encore renseignées
    // Permet de tester le flux complet sans bloquer le site avant que le client n'ait créé son compte PayTech
    const simulationUrl = `${origin}/commande-confirmee?ref=${encodeURIComponent(order.ref_command)}&mode=sandbox&total=${order.total_amount}`;

    return NextResponse.json({
      success: true,
      redirectUrl: simulationUrl,
      ref_command: order.ref_command,
      isSandbox: true,
      notice: 'Clés API PayTech non renseignées. Redirection vers la confirmation en mode test.',
    });
  } catch (err: any) {
    console.error('Erreur dans /api/paytech/checkout:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
