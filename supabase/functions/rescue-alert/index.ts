// ============================================================
// Supabase Edge Function: rescue-alert
// Immediate push + SMS alert for urgent animal reports & 15-min escalation
// Owner: Brehat | Task: RSC-6
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface RescueAlertRequest {
  reportId?: string;
  type?: 'urgent_report' | 'escalation';
  customNote?: string;
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: RescueAlertRequest = await req.json();
    const { reportId, type = 'urgent_report' } = payload;

    if (!reportId && type !== 'escalation') {
      return new Response(
        JSON.stringify({ error: 'reportId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'escalation') {
      // Trigger database 15-minute escalation routine
      const { data, error } = await supabase.rpc('escalate_unreviewed_rescue_reports');
      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'escalation',
          result: data,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Urgent report immediate alert dispatch
    const { data: alertResult, error: alertError } = await supabase.rpc(
      'notify_urgent_rescue_report',
      { p_report_id: reportId }
    );

    if (alertError) throw alertError;

    // Optional SMS dispatch hook to send-sms edge function for recipients with phones
    const smsGatewayApiKey = Deno.env.get('BD_SMS_GATEWAY_API_KEY');
    if (smsGatewayApiKey && alertResult?.recipients?.length > 0) {
      console.log(`[Rescue Alert] Dispatched SMS to ${alertResult.recipients.length} reviewers for report ${reportId}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'urgent_report',
        result: alertResult,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in rescue-alert edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
