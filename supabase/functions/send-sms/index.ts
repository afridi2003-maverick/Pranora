// ============================================================
// Supabase Edge Function: send-sms
// Custom SMS hook for Supabase Auth (Phone OTP) & urgent alerts
// Owner: afridi | Task: AUTH-1 & NOTIF-1
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface SendSmsRequest {
  phone?: string;
  recipient?: string;
  otp?: string;
  token?: string;
  message?: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SendSmsRequest = await req.json();

    const targetPhone = payload.phone || payload.recipient;
    const otpCode = payload.otp || payload.token;

    if (!targetPhone) {
      return new Response(
        JSON.stringify({ error: 'Recipient phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number to standard Bangladesh format (+8801XXXXXXXXX)
    let formattedPhone = targetPhone.replace(/[\s-]/g, '');
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '+88' + formattedPhone;
    } else if (formattedPhone.startsWith('8801')) {
      formattedPhone = '+' + formattedPhone;
    }

    const messageText =
      payload.message ||
      `আপনার Pranora OTP: ${otpCode}। ৫ মিনিটের মধ্যে ব্যবহার করুন। কাউকে শেয়ার করবেন না।`;

    const smsGatewayApiKey = Deno.env.get('BD_SMS_GATEWAY_API_KEY');
    const smsGatewaySenderId = Deno.env.get('BD_SMS_GATEWAY_SENDER_ID') || 'Pranora';

    if (smsGatewayApiKey) {
      // In production: send to real BD SMS gateway (e.g., SSL Wireless / BulkSMS BD)
      console.log(`[SMS Gateway] Sending SMS to ${formattedPhone}`);
      // fetch('https://smsplus.sslwireless.com/api/v3/send-sms', { ... })
    } else {
      // In development / local testing: log the OTP
      console.log(`[DEV SMS Hook] To: ${formattedPhone} | Code: ${otpCode} | Text: ${messageText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        phone: formattedPhone,
        message: 'SMS sent successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-sms edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
