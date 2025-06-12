import { SupabaseClient } from "@supabase/supabase-js";
// It is important to add the .js extension so ESM imports this file properly
import { StringSession } from "telegram/sessions/index.js";
import { SupabaseStorage } from "../../../adapters/supabase/supabase";
import { Context } from "../../../types/index";
import { SessionManager } from "./session-manager";

/**
 * This class extends the StringSession class from the Telegram library.
 *
 * It adds the ability to save and load the session data from Supabase.
 */
export class SupabaseSession extends StringSession implements SessionManager {
  _storage: SupabaseStorage;
  _supabase: SupabaseClient;

  constructor(client: SupabaseClient, octokit: Context["octokit"], session?: string) {
    super(session);
    this._supabase = client;
    this._storage = new SupabaseStorage(octokit, this._supabase);
  }

  getStorageHandler(): SupabaseStorage {
    return this._storage;
  }

  getClient() {
    return this._supabase;
  }

  async saveSession(): Promise<void> {
    await this._supabase?.from("tg-bot-sessions").insert([{ session_data: super.save() }]);
  }

  async loadSession(): Promise<SupabaseSession> {
    const session = await this._supabase?.from("tg-bot-sessions").select("session_data").single();

    if (session.data) {
      return new SupabaseSession(this._supabase, this._storage.octokit, session.data.session_data);
    } else {
      throw new Error("No session found. Please run the SMS Login script first.");
    }
  }

  async getSession(): Promise<string> {
    const session = await this._supabase?.from("tg-bot-sessions").select("session_data").single();

    if (session.data) {
      return session.data.session_data;
    } else {
      throw new Error("No session found. Please run the SMS Login script first.");
    }
  }

  async deleteSession(): Promise<void> {
    await this._supabase?.from("tg-bot-sessions").delete();
  }
}
