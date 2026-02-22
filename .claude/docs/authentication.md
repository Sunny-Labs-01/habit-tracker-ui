# Authentication Deep Dive

## Keycloak Configuration

- **Realm:** `habit-tracker`
- **Client ID:** `habit-tracker-ui`
- **PKCE:** S256 (required)
- **Init Mode:** `check-sso` (silent auth check on load)

## Auth Flow

1. `KeycloakProvider` initializes Keycloak on mount
2. If user has valid session, tokens are loaded automatically
3. Unauthenticated users see login/register prompt (`AuthRequired` component)
4. Tokens auto-refresh every 30 seconds (or on expiry)
5. All API requests include `Authorization: Bearer <token>` header

## useKeycloak() Hook

```typescript
const {
  authenticated,  // boolean - is user logged in
  token,          // string - JWT access token
  loading,        // boolean - auth init in progress
  error,          // string - auth error message
  login,          // () => void - redirect to login
  logout,         // () => void - redirect to logout
  register,       // () => void - redirect to registration
  userInfo,       // UserInfo - user profile data
} = useKeycloak();
```

## Auth-Protected Content

Wrap content with `AuthRequired` to show login prompt for unauthenticated users:

```tsx
<AuthRequired>
  <ProtectedContent />
</AuthRequired>
```

## Modifying Auth Flow

1. Changes go in `src/hooks/KeycloakProvider.tsx`
2. Test with Keycloak dev server
3. Verify token refresh works
