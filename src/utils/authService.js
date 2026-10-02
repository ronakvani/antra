import { createClient } from '@supabase/supabase-js';

/**
 * Official DiceBear Voxel-Bot Avatar Generator
 * Documentation: https://www.dicebear.com/styles/voxel-bot/#usage
 */
export const getDiceBearVoxelBotAvatar = (seed = 'user') => {
  const cleanSeed = encodeURIComponent(String(seed || 'user').trim());
  return `https://api.dicebear.com/10.x/voxel-bot/svg?seed=${cleanSeed}&radius=50`;
};

// Storage keys
const SUPABASE_URL_KEY = 'antra_supabase_url';
const SUPABASE_ANON_KEY = 'antra_supabase_anon_key';
const LOCAL_STORAGE_USERS_KEY = 'antra_builder_registered_users';
const LOCAL_STORAGE_SESSION_KEY = 'antra_builder_current_session';

/**
 * Get current Supabase credentials (from .env or localStorage)
 */
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
  const localKey = localStorage.getItem(SUPABASE_ANON_KEY);

  const url = (localUrl || envUrl || '').trim();
  const anonKey = (localKey || envKey || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    url.startsWith('http')
  );

  return { url, anonKey, isConfigured };
}

let supabaseInstance = null;

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    if (!supabaseInstance || supabaseInstance.supabaseUrl !== url) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
    return supabaseInstance;
  }
  return null;
}

export function setSupabaseCredentials(url, anonKey) {
  if (url && anonKey) {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
    supabaseInstance = createClient(url.trim(), anonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY);
    supabaseInstance = null;
  }
}

// Local storage fallback helpers
const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    // ignore
  }
};

const getLocalSession = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveLocalSession = (session) => {
  try {
    if (session) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
  } catch (e) {
    // ignore
  }
};

/**
 * Sign up a new user
 */
export async function signUpBuilder({ email, password, username, avatarSeed }) {
  const seed = avatarSeed || username || email.split('@')[0];
  const avatarUrl = getDiceBearVoxelBotAvatar(seed);
  const displayName = username || email.split('@')[0];

  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          username: displayName,
          avatarSeed: seed,
          avatarUrl: avatarUrl
        }
      }
    });

    if (error) throw error;

    const user = {
      id: data.user?.id || `user_${Date.now()}`,
      email: data.user?.email || email,
      username: displayName,
      avatarSeed: seed,
      avatarUrl: avatarUrl,
      confirmed: Boolean(data.user?.confirmed_at || data.session)
    };

    saveLocalSession(user);
    return user;
  }

  // Local persistence fallback
  const users = getLocalUsers();
  const cleanEmail = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    password: password,
    username: displayName,
    avatarSeed: seed,
    avatarUrl: avatarUrl,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);

  const { password: _, ...sessionUser } = newUser;
  saveLocalSession(sessionUser);
  return sessionUser;
}

/**
 * Sign in existing user
 */
export async function signInBuilder({ email, password }) {
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;

    const metadata = data.user?.user_metadata || {};
    const seed = metadata.avatarSeed || metadata.username || email.split('@')[0];
    const user = {
      id: data.user.id,
      email: data.user.email,
      username: metadata.username || email.split('@')[0],
      avatarSeed: seed,
      avatarUrl: metadata.avatarUrl || getDiceBearVoxelBotAvatar(seed)
    };

    saveLocalSession(user);
    return user;
  }

  // Local persistence fallback
  const users = getLocalUsers();
  const cleanEmail = email.trim().toLowerCase();
  const found = users.find((u) => u.email === cleanEmail && u.password === password);

  if (!found) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const { password: _, ...sessionUser } = found;
  if (!sessionUser.avatarUrl) {
    sessionUser.avatarUrl = getDiceBearVoxelBotAvatar(sessionUser.avatarSeed || sessionUser.username || cleanEmail);
  }
  saveLocalSession(sessionUser);
  return sessionUser;
}

/**
 * Sign out current user
 */
export async function signOutBuilder() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
  saveLocalSession(null);
  return true;
}

/**
 * Get current user session
 */
export async function getCurrentBuilderUser() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const metadata = user.user_metadata || {};
        const seed = metadata.avatarSeed || metadata.username || user.email.split('@')[0];
        const sessionUser = {
          id: user.id,
          email: user.email,
          username: metadata.username || user.email.split('@')[0],
          avatarSeed: seed,
          avatarUrl: metadata.avatarUrl || getDiceBearVoxelBotAvatar(seed)
        };
        saveLocalSession(sessionUser);
        return sessionUser;
      }
    } catch (e) {
      // fallback
    }
  }

  return getLocalSession();
}
