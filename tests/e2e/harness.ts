/**
 * Pranora E2E Test Harness (REL-1)
 * Owner: Afridi | Sprint: S7
 *
 * Core test harness for executing critical end-to-end integration flows:
 * - OTP Login & Role Onboarding (AUTH-1, AUTH-5)
 * - Nearest Vet Discovery & Emergency Mode (MAP-1, MAP-7)
 * - Vet Appointment Booking & Cash Payment (APT-1, APT-3, PAY-1)
 * - Rescue Report & Escalation Lifecycle (RSC-1, RSC-6, RSC-7)
 * - Adoption Application, Decision & Handover (ADP-1, ADP-3, ADP-5, ADP-6)
 * - Pet Vaccine Schedule, Notes & SMS Reminders (HLT-1, HLT-7, HLT-2, HLT-6)
 */

import assert from 'node:assert';

export interface TestUser {
  id: string;
  phone: string;
  fullName: string;
  roles: string[];
  locale: 'bn' | 'en';
}

export interface E2EResult {
  flowName: string;
  passed: boolean;
  durationMs: number;
  steps: string[];
  error?: string;
}

/**
 * Creates a mock test environment context with isolated state
 */
export function createE2EContext() {
  const steps: string[] = [];

  const logStep = (stepDescription: string) => {
    steps.push(stepDescription);
  };

  const users = new Map<string, TestUser>();
  const bookings = new Map<string, any>();
  const rescueCases = new Map<string, any>();
  const adoptionListings = new Map<string, any>();
  const adoptionApplications = new Map<string, any>();
  const healthReminders = new Map<string, any>();
  const smsOutbox: Array<{ to: string; message: string; timestamp: string }> = [];

  return {
    steps,
    logStep,
    users,
    bookings,
    rescueCases,
    adoptionListings,
    adoptionApplications,
    healthReminders,
    smsOutbox,

    createUser(data: Partial<TestUser>): TestUser {
      const id = data.id ?? `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const user: TestUser = {
        id,
        phone: data.phone ?? '+8801712345678',
        fullName: data.fullName ?? 'Test User',
        roles: data.roles ?? ['owner'],
        locale: data.locale ?? 'bn',
      };
      users.set(id, user);
      logStep(`Created test user ${user.fullName} (${user.id}) with roles [${user.roles.join(', ')}]`);
      return user;
    },

    dispatchSms(to: string, message: string) {
      smsOutbox.push({ to, message, timestamp: new Date().toISOString() });
      logStep(`SMS sent to ${to}: "${message.slice(0, 40)}..."`);
    },
  };
}

export type E2EContext = ReturnType<typeof createE2EContext>;

/**
 * Haversine distance calculator in meters between two coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

