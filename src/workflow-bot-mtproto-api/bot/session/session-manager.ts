import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StringSession } from "telegram/sessions/index.js";
import { GithubStorage } from "../../../adapters/github/storage-layer";
import { SupabaseStorage } from "../../../adapters/supabase/supabase";
import { Context } from "../../../types/index";
import { GitHubSession } from "./github-session";
import { SupabaseSession } from "./supabase-session";

export interface SessionManager extends StringSession {
  getStorageHandler(): GithubStorage | SupabaseStorage;
  saveSession(): Promise<void>;
  loadSession(): Promise<GitHubSession | SupabaseSession>;
  getSession(): Promise<string>;
  deleteSession(): Promise<void>;
  getClient(): SupabaseClient | void;
}

export class SessionManagerFactory {
  // eslint-disable-next-line sonarjs/public-static-readonly
  static sessionManager: SessionManager;
  // eslint-disable-next-line sonarjs/public-static-readonly
  static storage: GithubStorage | SupabaseStorage;

  static createSessionManager(context: Context, session?: string): SessionManager {
    if (this.sessionManager) {
      return this.sessionManager;
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = context.pluginEnvCtx.getEnv().TELEGRAM_BOT_ENV.storageSettings;
    const { octokit } = context;

    if (context.config.shouldUseGithubStorage) {
      this.sessionManager = new GitHubSession(session);
    } else {
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      this.sessionManager = new SupabaseSession(supabaseClient, octokit, session);
    }

    return this.sessionManager;
  }
}
