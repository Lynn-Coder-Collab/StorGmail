import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

// Get deposits for current user
export const getUserDeposits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { deposits: data ?? [] };
  });

// Get user profile
export const getUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

// Create a new deposit
export const createDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      customId: z.string().min(1).max(20),
      accountData: z.array(z.object({
        email: z.string().email().max(255),
        password: z.string().min(1).max(255),
        recovery: z.string().min(1).max(255),
      })).min(1).max(500),
      totalPrice: z.number().min(0),
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("deposits").insert({
      custom_id: data.customId,
      user_id: userId,
      account_data: data.accountData as any,
      total_price: data.totalPrice,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// Get user's role
export const getUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    return { role: data?.role ?? "user" };
  });

// Admin: get all deposits
export const getAllDeposits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    // RLS will enforce admin-only access
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { deposits: data ?? [] };
  });

// Admin: approve deposit
export const approveDepositFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ depositId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Get deposit info
    const { data: deposit, error: fetchErr } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", data.depositId)
      .single();
    if (fetchErr || !deposit) throw new Error("Deposit not found");
    if (deposit.status !== "pending") throw new Error("Deposit already processed");

    // Update deposit status (uses admin RLS policy)
    const { error: updateErr } = await supabase
      .from("deposits")
      .update({ status: "valid" })
      .eq("id", data.depositId);
    if (updateErr) throw new Error(updateErr.message);

    // Update user balance using admin client (bypasses RLS for cross-user update)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("balance")
      .eq("user_id", deposit.user_id)
      .single();

    if (profile) {
      await supabaseAdmin
        .from("profiles")
        .update({ balance: profile.balance + deposit.total_price })
        .eq("user_id", deposit.user_id);
    }

    return { success: true };
  });

// Admin: reject deposit
export const rejectDepositFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ depositId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("deposits")
      .update({ status: "invalid" })
      .eq("id", data.depositId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// Get next sequence number for custom ID
export const getNextSequence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { count } = await supabase
      .from("deposits")
      .select("*", { count: "exact", head: true });
    return { sequence: (count ?? 0) + 1 };
  });

// Create withdrawal request
export const createWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      amount: z.number().min(50000),
      bankName: z.string().min(1).max(100),
      accountNumber: z.string().min(1).max(50).regex(/^[0-9]+$/),
      accountHolder: z.string().min(1).max(255),
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", userId)
      .single();
    if (!profile || profile.balance < data.amount) {
      throw new Error("Saldo tidak mencukupi");
    }

    // Deduct balance
    await supabaseAdmin
      .from("profiles")
      .update({ balance: profile.balance - data.amount })
      .eq("user_id", userId);

    // Create withdrawal record
    const { error } = await supabase.from("withdrawals").insert({
      user_id: userId,
      amount: data.amount,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder: data.accountHolder,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// Get user withdrawals
export const getUserWithdrawals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { withdrawals: data ?? [] };
  });