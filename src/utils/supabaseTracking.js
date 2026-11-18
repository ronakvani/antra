import { getSupabaseClient } from './authService';
import { ANTRA_PLANS, getUserPlanConfig } from './planFeatures';

// Storage keys for offline resilience & fast local state
const LOCAL_SUBSCRIPTION_KEY = 'antra_user_subscription';
const LOCAL_ACTIVITY_LOGS_KEY = 'antra_user_activity_logs';
const LOCAL_WEBSITES_KEY = 'antra_user_created_websites';

/**
 * Validate UUID format
 */
export const isValidUuid = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Get normalized clean user identity
 */
export const getCleanIdentity = (user) => {
  const email = (user?.email || '').trim().toLowerCase() || 'creator@antra.studio';
  const plan = (user?.plan || 'pro').toLowerCase();
  const userId = isValidUuid(user?.id) ? user.id : null;
  return { email, plan, userId, rawUser: user };
};

/**
 * Log user actions to Supabase public.user_activity_logs
 */
export async function logUserActivity({ user, action, details = {} }) {
  const { email, plan, userId } = getCleanIdentity(user);
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'antra-web';

  const logEntry = {
    user_id: userId,
    email,
    action,
    plan,
    details,
    user_agent: userAgent,
    created_at: timestamp
  };

  // 1. Save to local storage for fast inspection / offline fallback
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_LOGS_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift(logEntry);
    localStorage.setItem(LOCAL_ACTIVITY_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    // ignore local storage errors
  }

  // 2. Push to Supabase if connected
  if (client) {
    try {
      const { error } = await client.from('user_activity_logs').insert([logEntry]);
      if (error) {
        console.warn('Supabase logUserActivity notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase logUserActivity network error:', err);
    }
  }

  return logEntry;
}

/**
 * Synchronize and Upsert Subscription details into Supabase public.user_subscriptions
 */
export async function syncUserSubscription({ user, planId, billingCycle = 'monthly', status = 'active' }) {
  const targetPlanId = (planId || user?.plan || 'pro').toLowerCase();
  const planConfig = ANTRA_PLANS[targetPlanId] || ANTRA_PLANS.pro;
  const { email, userId } = getCleanIdentity(user);
  const client = getSupabaseClient();

  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30); // 30-day active billing window

  let existingRecord = null;

  // Check remote existing record
  if (client) {
    try {
      let query = client.from('user_subscriptions').select('*');
      if (userId) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
      } else {
        query = query.eq('email', email);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        existingRecord = data;
      }
    } catch (e) {
      // ignore
    }
  }

  // Fallback to local cache if no remote
  if (!existingRecord) {
    try {
      const raw = localStorage.getItem(LOCAL_SUBSCRIPTION_KEY);
      if (raw) existingRecord = JSON.parse(raw);
    } catch (e) {
      // ignore
    }
  }

  const sitesCreated = existingRecord?.sites_created_count ?? 0;
  const aiGensUsed = existingRecord?.ai_video_gens_used ?? 0;
  const storageUsed = existingRecord?.storage_used_mb ?? 0;

  const subscriptionPayload = {
    user_id: userId,
    email,
    plan: planConfig.id,
    plan_display_name: planConfig.displayName,
    plan_start_date: existingRecord?.plan === planConfig.id && existingRecord?.plan_start_date
      ? existingRecord.plan_start_date
      : startDate.toISOString(),
    plan_end_date: existingRecord?.plan === planConfig.id && existingRecord?.plan_end_date
      ? existingRecord.plan_end_date
      : endDate.toISOString(),
    billing_cycle: billingCycle,
    price_usd: planConfig.priceUsd || 4.50,
    price_inr: planConfig.priceInr || 379,
    status,
    max_sites: planConfig.limits.maxSites,
    max_video_duration_sec: planConfig.limits.maxVideoDuration,
    storage_mb: planConfig.limits.storageMB,
    included_ai_video_gens: planConfig.features.includedAIVideoGens || 0,
    sites_created_count: sitesCreated,
    ai_video_gens_used: aiGensUsed,
    storage_used_mb: storageUsed,
    tags: planConfig.tags || [`plan:${planConfig.id}`, `limit:${planConfig.limits.maxSites}_sites`],
    features: planConfig.features,
    updated_at: new Date().toISOString()
  };

  // 1. Cache locally
  try {
    localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(subscriptionPayload));
  } catch (e) {
    // ignore
  }

  // 2. Persist to Supabase
  if (client) {
    try {
      const { data, error } = await client
        .from('user_subscriptions')
        .upsert(subscriptionPayload, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase syncUserSubscription notice:', error.message);
      } else if (data) {
        localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Supabase syncUserSubscription network error:', err);
    }
  }

  return subscriptionPayload;
}

/**
 * Fetch active user subscription and current limit metrics
 */
export async function getUserSubscription(user) {
  const { email, userId, plan } = getCleanIdentity(user);
  const client = getSupabaseClient();

  if (client) {
    try {
      let query = client.from('user_subscriptions').select('*');
      if (userId) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
      } else {
        query = query.eq('email', email);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // ignore
    }
  }

  // Try local storage
  try {
    const raw = localStorage.getItem(LOCAL_SUBSCRIPTION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email === email) return parsed;
    }
  } catch (e) {
    // ignore
  }

  // Generate default subscription configuration
  return syncUserSubscription({ user, planId: plan });
}

/**
 * Check if the user is allowed to create / publish a new website based on plan limits
 * Pro: 1 site
 * Ultra: 5 sites
 * Max: 15 sites
 */
export async function checkSiteLimitAllowed(user) {
  const { email, userId, plan } = getCleanIdentity(user);
  const planConfig = ANTRA_PLANS[plan] || ANTRA_PLANS.pro;
  const maxSites = planConfig.limits.maxSites || 1;
  const client = getSupabaseClient();

  let count = 0;

  if (client) {
    try {
      let query = client.from('user_websites').select('id', { count: 'exact', head: true });
      if (userId) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
      } else {
        query = query.eq('email', email);
      }
      const { count: websiteCount, error } = await query;
      if (!error && typeof websiteCount === 'number') {
        count = websiteCount;
      }
    } catch (e) {
      // fallback
    }
  }

  // Check local websites count fallback
  try {
    const raw = localStorage.getItem(LOCAL_WEBSITES_KEY);
    const localSites = raw ? JSON.parse(raw) : [];
    const userLocalSites = localSites.filter(
      (s) => s.email === email || (userId && s.user_id === userId)
    );
    count = Math.max(count, userLocalSites.length);
  } catch (e) {
    // ignore
  }

  const allowed = count < maxSites;
  const remaining = Math.max(0, maxSites - count);
  const nextPlan = plan === 'pro' ? 'ultra' : plan === 'ultra' ? 'max' : null;
  const nextPlanMaxSites = plan === 'pro' ? 5 : plan === 'ultra' ? 15 : null;

  return {
    allowed,
    count,
    maxSites,
    remaining,
    plan,
    planDisplayName: planConfig.displayName,
    nextPlan,
    nextPlanMaxSites,
    tags: planConfig.tags,
    message: allowed
      ? `You have used ${count} of ${maxSites} sites allowed on ${planConfig.displayName}.`
      : `Site creation limit reached: ${planConfig.displayName} allows maximum ${maxSites} website${maxSites > 1 ? 's' : ''}.`
  };
}

/**
 * Record a newly created / published website in Supabase
 * Enforces limit checks, records website, updates count, and logs activity.
 */
export async function recordSiteCreation({ user, title, manifest, subdomain = '' }) {
  const limitCheck = await checkSiteLimitAllowed(user);
  const { email, userId, plan } = getCleanIdentity(user);

  // If user exceeded plan limit, log activity and reject
  if (!limitCheck.allowed) {
    await logUserActivity({
      user,
      action: 'limit_reached',
      details: {
        feature: 'websites',
        attempted_title: title || 'Untitled Site',
        count: limitCheck.count,
        maxSites: limitCheck.maxSites,
        plan,
        tags: limitCheck.tags,
        message: limitCheck.message
      }
    });

    return {
      success: false,
      reason: 'limit_reached',
      limitCheck
    };
  }

  const client = getSupabaseClient();
  const cleanTitle = (title || 'Untitled Antra Project').trim();
  const cleanSubdomain = (subdomain || cleanTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32)).trim();

  const sitePayload = {
    user_id: userId,
    email,
    title: cleanTitle,
    subdomain: cleanSubdomain,
    manifest: manifest || {},
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  let savedSite = { ...sitePayload, id: `site_${Date.now()}` };

  // 1. Save to local websites
  try {
    const raw = localStorage.getItem(LOCAL_WEBSITES_KEY);
    const sites = raw ? JSON.parse(raw) : [];
    sites.push(savedSite);
    localStorage.setItem(LOCAL_WEBSITES_KEY, JSON.stringify(sites));
  } catch (e) {
    // ignore
  }

  // 2. Save to Supabase public.user_websites
  if (client) {
    try {
      const { data, error } = await client
        .from('user_websites')
        .insert([sitePayload])
        .select()
        .single();

      if (!error && data) {
        savedSite = data;
      } else if (error) {
        console.warn('Supabase recordSiteCreation notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase recordSiteCreation network error:', err);
    }
  }

  // 3. Update sites_created_count in user_subscriptions
  const newCount = limitCheck.count + 1;
  if (client) {
    try {
      await client
        .from('user_subscriptions')
        .update({
          sites_created_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
    } catch (e) {
      // ignore
    }
  }

  // Update cached subscription
  try {
    const rawSub = localStorage.getItem(LOCAL_SUBSCRIPTION_KEY);
    if (rawSub) {
      const parsedSub = JSON.parse(rawSub);
      parsedSub.sites_created_count = newCount;
      localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(parsedSub));
    }
  } catch (e) {
    // ignore
  }

  // 4. Log successful website publication activity
  await logUserActivity({
    user,
    action: 'website_published',
    details: {
      site_id: savedSite.id,
      title: cleanTitle,
      subdomain: cleanSubdomain,
      sites_count_now: newCount,
      max_sites_allowed: limitCheck.maxSites,
      plan
    }
  });

  return {
    success: true,
    website: savedSite,
    limitCheck: {
      ...limitCheck,
      count: newCount,
      remaining: Math.max(0, limitCheck.maxSites - newCount)
    }
  };
}

/**
 * Fetch all websites created by user
 */
export async function getUserWebsites(user) {
  const { email, userId } = getCleanIdentity(user);
  const client = getSupabaseClient();

  if (client) {
    try {
      let query = client.from('user_websites').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
      } else {
        query = query.eq('email', email);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      // fallback
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_WEBSITES_KEY);
    const sites = raw ? JSON.parse(raw) : [];
    return sites.filter((s) => s.email === email || (userId && s.user_id === userId));
  } catch (e) {
    return [];
  }
}
