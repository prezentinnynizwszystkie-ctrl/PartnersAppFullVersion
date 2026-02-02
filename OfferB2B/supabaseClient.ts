import { createClient } from '@supabase/supabase-js';

// Placeholder musi mieć format poprawnego URL (np. https://...), aby uniknąć błędu "Failed to construct 'URL'".
// Wpisz tutaj swoje prawdziwe dane z Supabase Dashboard -> Project Settings -> API
const supabaseUrl = 'https://twoj-projekt.supabase.co';
const supabaseKey = 'twoj-klucz-api';

export const supabase = createClient(supabaseUrl, supabaseKey);