// Simple module to hold the auth token, breaking the circular dependency
// between api.ts and authStore.ts
let _token: string | null = null;
let _logoutFn: (() => void) | null = null;

export function setToken(token: string | null) {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

export function setLogoutFn(fn: () => void) {
  _logoutFn = fn;
}

export function callLogout() {
  _logoutFn?.();
}
