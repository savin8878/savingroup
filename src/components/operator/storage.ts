// components/operator/storage.ts
//
// Where the conversation is kept between page loads (sessionStorage, see
// useOperatorChat). In a module of its own so <OperatorRoot>, which is in
// every page's initial bundle, can drop a transcript that crashed the panel
// without importing the chat hook and everything behind it.

export const STORAGE_KEY = "savin-operator:v1";

/** Forget the stored conversation. Never throws: private modes and blocked storage do. */
export function forgetStoredTranscript(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, or nothing that can be.
  }
}
