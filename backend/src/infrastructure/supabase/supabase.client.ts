import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseClientService {
  readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    // Service role key bypasses RLS — required for server-side auth guard DB lookups.
    // Falls back to anon key if not set (RLS must be disabled or permissive in that case).
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
}
