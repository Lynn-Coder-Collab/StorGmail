// Simple in-memory store (will be replaced with Lovable Cloud later)
import type { Deposit, User } from "./eternix";

let deposits: Deposit[] = [
  {
    id: "1",
    customId: "01GCKGDC26",
    userId: "user1",
    userEmail: "john@example.com",
    accountData: [
      { email: "test1@gmail.com", password: "pass123", recovery: "081234567890" },
      { email: "test2@gmail.com", password: "pass456", recovery: "081234567891" },
    ],
    totalPrice: 7000,
    status: "pending",
    timestamp: Date.now() - 3600000,
  },
  {
    id: "2",
    customId: "02GCKGDC26",
    userId: "user1",
    userEmail: "john@example.com",
    accountData: Array.from({ length: 15 }, (_, i) => ({
      email: `bulk${i}@gmail.com`,
      password: `pass${i}`,
      recovery: `08123456${String(i).padStart(4, "0")}`,
    })),
    totalPrice: 63000,
    status: "valid",
    timestamp: Date.now() - 7200000,
  },
];

let currentUser: User = {
  uid: "user1",
  email: "john@example.com",
  balance: 63000,
};

let nextSeq = 3;

export function getDeposits(): Deposit[] {
  return [...deposits];
}

export function addDeposit(deposit: Omit<Deposit, "id" | "customId" | "timestamp">): Deposit {
  const { generateCustomId } = require("./eternix");
  const newDeposit: Deposit = {
    ...deposit,
    id: String(nextSeq),
    customId: generateCustomId(nextSeq),
    timestamp: Date.now(),
  };
  nextSeq++;
  deposits = [newDeposit, ...deposits];
  return newDeposit;
}

export function approveDeposit(depositId: string): boolean {
  const dep = deposits.find((d) => d.id === depositId);
  if (!dep || dep.status !== "pending") return false;
  dep.status = "valid";
  if (dep.userId === currentUser.uid) {
    currentUser.balance += dep.totalPrice;
  }
  return true;
}

export function rejectDeposit(depositId: string): boolean {
  const dep = deposits.find((d) => d.id === depositId);
  if (!dep || dep.status !== "pending") return false;
  dep.status = "invalid";
  return true;
}

export function getCurrentUser(): User {
  return { ...currentUser };
}