// Eternix System - Utility Functions

// ============ Custom ID Generator ============
// Format: [Urutan][ProductCode][AI-Sign][Year]
// Example: 01GCKGDC26

const AI_SIGN = "CKGDC";

export type ProductCode = "G" | "S"; // G = Gmail, S = SMM

export function generateCustomId(
  sequence: number,
  productCode: ProductCode = "G"
): string {
  const seq = String(sequence).padStart(2, "0");
  const year = String(new Date().getFullYear()).slice(-2);
  return `${seq}${productCode}${AI_SIGN}${year}`;
}

// ============ Tiered Pricing Logic ============

export interface PricingTier {
  min: number;
  max: number | null;
  pricePerAccount: number;
  label: string;
}

export const PRICING_TIERS: PricingTier[] = [
  { min: 1, max: 10, pricePerAccount: 3500, label: "1-10 akun" },
  { min: 11, max: 50, pricePerAccount: 4200, label: "11-50 akun" },
  { min: 51, max: null, pricePerAccount: 5000, label: "51+ akun" },
];

export function getPricePerAccount(count: number): number {
  if (count <= 0) return 0;
  const tier = PRICING_TIERS.find(
    (t) => count >= t.min && (t.max === null || count <= t.max)
  );
  return tier?.pricePerAccount ?? 5000;
}

export function calculateTotalPrice(count: number): number {
  return count * getPricePerAccount(count);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============ Account Parser ============
// Format: email|password|recovery (one per line)

export interface ParsedAccount {
  email: string;
  password: string;
  recovery: string;
}

export interface ParseResult {
  valid: ParsedAccount[];
  invalid: string[];
}

export function parseAccountData(raw: string): ParseResult {
  const lines = raw.split("\n").filter((l) => l.trim());
  const valid: ParsedAccount[] = [];
  const invalid: string[] = [];

  for (const line of lines) {
    const parts = line.trim().split("|");
    if (parts.length >= 3 && parts[0].includes("@")) {
      valid.push({
        email: parts[0].trim(),
        password: parts[1].trim(),
        recovery: parts[2].trim(),
      });
    } else {
      invalid.push(line.trim());
    }
  }

  return { valid, invalid };
}

// ============ Types ============

export type DepositStatus = "pending" | "valid" | "invalid";

export interface Deposit {
  id: string;
  customId: string;
  userId: string;
  userEmail: string;
  accountData: ParsedAccount[];
  totalPrice: number;
  status: DepositStatus;
  timestamp: number;
}

export interface User {
  uid: string;
  email: string;
  balance: number;
}