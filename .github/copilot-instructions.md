# Divino – Copilot Workspace Instructions

Divino is a **React Native + Redux + Express backend** mobile app. These instructions help agents understand the architecture, avoid common pitfalls, and work productively.

## Architecture

**Frontend:** React Native (JS/TS mix) with Redux state management, Redux-Saga for async side effects, and React Navigation for routing.
- **Root:** `index.js` → `App.tsx` (TypeScript entry point)
- **Redux store:** `src/app/reducers/index.js` — combines reducers, applies redux-persist to AsyncStorage, integrates saga middleware
- **Routing:** `src/navigations/Index.js` — switches between `AuthNav` (login/register) and `MainNav` (authenticated screens) based on `state.auth.data`
- **Auth flow:** Redux actions → Redux-Saga (fetch API) → reducer updates state → Navigation reacts

**Backend:** Node/Express with Mongoose ODM and JWT auth.
- **Server entry:** `server.js` — starts on `PORT` (default 9000 from `.env`), connects MongoDB, mounts `/api/auth/*` routes
- **Auth endpoints:** `/api/auth/login`, `/api/auth/register` (defined in `authRoutes.js`; implementation referenced in [API_SETUP_GUIDE.md](../API_SETUP_GUIDE.md))
- **Database:** MongoDB (connection string in `.env` as `MONGODB_URI`)

**Data Flow:** Screens dispatch Redux actions → Saga calls API (auto-discovers dev server host) → API response (user + token) stored in Redux state → Token persisted to AsyncStorage → Navigation keys off `!!state.auth.data`.

## Build and Test

```bash
npm install              # Install deps (requires Node ≥20)
npm start                # Start Metro bundler (required for all dev)
npm run android          # Build and run on Android device/emulator (auto-applies adb reverse)
npm run ios              # Build and run on iOS simulator (requires `bundle install` once, then `bundle exec pod install` after native dep changes)
npm test                 # Jest runner
npm run lint             # ESLint check
```

**See** [README.md](../README.md) for full setup and troubleshooting.

## Code Style & Conventions

- **Language:** Mostly JavaScript; `App.tsx` is TypeScript; eslint configured for JS (`.eslintrc.js`)
- **State & Actions:** Redux with action types in `src/app/actions.js`; reducers handle request/completed/error states in `src/app/reducers/`
- **Auth State Shape:** `{ data: null|{id, email, name, token}, isLoading, isError, errorMessage }` (defined in `src/app/reducers/auth.js`)
- **Async Side Effects:** Redux-Saga generators in `src/app/sagas/auth.js`; fallback mock user on API failure (for dev)
- **API Layer:** `src/app/api/auth.js` — Multi-host fallback (discovers Metro host from `NativeModules.SourceCode.scriptURL`, tries `10.0.2.2` for emulator, falls back to `localhost`); tries multiple endpoint paths (`/auth/login`, `/login`)
- **Navigation:** Screen names as constants in `src/utils/routes.js`; screens use `useNavigation()` and `useSelector`/`useDispatch` for Redux
- **Components:** Functional, reusable (e.g., `CustomButton`, `CustomTextInput` in `src/components/`)
- **Screens:** Located in `src/screens/` (auth screens in `src/screens/auth/`); receive navigation prop; use Redux dispatch for auth actions
- **Persistence:** redux-persist stores auth reducer to AsyncStorage; whitelist: `['auth']` (see `src/app/reducers/index.js`)
- **Logging:** Extensive debug logs with emoji prefixes (🟢 success, 🟡 info, 🔴 error); helpful for troubleshooting dev issues

## Common Pitfalls & How to Avoid

1. **Android Emulator Network Fails**
   - Problem: Requests to `localhost` fail on Android emulator
   - Solution: API layer auto-discovers dev server host; ensure Metro runs on 8081 and adb reverse is applied
   - When: App can't login or API calls fail with "network request failed" on Android

2. **Port Collisions**
   - Problem: Port 8000 occupied by Symfony/XAMPP; Metro uses 8081; Node API starts on wrong port
   - Solution: Set `.env` to `PORT=9000`; API tries `[host]:9000` then `[host]:8000`
   - When: Server.js logs "already in use" or API calls get 404

3. **Stale Auth Controller**
   - Problem: Changes to auth logic don't apply until server restart
   - Solution: Manually kill and restart `node server.js` (no nodemon/auto-reload configured)
   - When: Login endpoint logic changes but tests still fail

4. **Redux Saga Payload Drop**
   - Problem: `yield call(authLogin,)` omits action payload, causing login to fail silently
   - Fix: Write `yield call(authLogin, action.payload)` instead
   - Where: Check `src/app/sagas/auth.js` line ~25

5. **PersistGate Crash**
   - Problem: App crashes with blank screen if `persistor` not passed or root reducer not wrapped with `persistReducer`
   - Check: `src/app/reducers/index.js` returns `{ store, persistor, runSaga }`; `App.tsx` passes `persistor` to `<PersistGate>`
   - When: App won't start or Redux state doesn't persist across restarts

6. **Using Context API Instead of Redux**
   - Problem: Project has unused `src/contexts/AuthContext.js` but auth is Redux-managed
   - Solution: Dispatch Redux actions for auth changes; don't mix patterns
   - When: Creating new auth-related features

7. **TypeScript/JS Mismatch**
   - Context: Project is configured for TypeScript (`tsconfig.json`) but 95% source is `.js`
   - Implication: Type checking may be loose; focus on Redux action constants and saga types
   - When: Adding new features, consider updating relevant `.js` to `.ts` if types improve clarity

## Key Files by Pattern

| Pattern | File | Purpose |
|---------|------|---------|
| Redux setup | `src/app/reducers/index.js` | Store factory, AsyncStorage persistence, saga middleware |
| Auth state | `src/app/reducers/auth.js` | State shape, action handlers |
| Async auth | `src/app/sagas/auth.js` | Saga generator, API call, error fallback |
| API client | `src/app/api/auth.js` | Multi-host discovery, endpoint fallback |
| Routing | `src/navigations/Index.js` | Conditional auth routing |
| Login flow | `src/screens/auth/Login.js` | Redux dispatch, form validation, error handling |
| Reusable UI | `src/components/CustomButton.js` | Button with loading state; re-used across screens |
| App entry | `App.tsx` | Provider hierarchy, Redux + PersistGate + SafeArea + Navigation |
| Server entry | `server.js` | Express config, CORS, MongoDB, route mounting |

## Environment & Dependencies

**Required:**
- Node ≥ 20 (check `.engines` in `package.json`)
- Java/Android SDK for Android builds (or Android Studio)
- Xcode + CocoaPods (`bundle install` required) for iOS

**Backend:**
- MongoDB running locally or connection string in `.env` (format: `mongodb://...` or MongoDB Atlas URI)
- `.env` file with: `PORT=9000`, `JWT_SECRET=*`, `MONGODB_URI=mongodb://...`

**Frontend:**
- Metro bundler must run (`npm start`) before building/running app
- For physical Android device: `adb reverse tcp:8081 tcp:8081` required (automated by `npm run android` script)

**Mobile:** React Native 0.83.1, React 19.2, redux, redux-saga, @react-navigation, nativewind/tailwind

## Design Rationale

- **Redux + Saga over Context:** Predictable state updates, DevTools support, side effect isolation
- **redux-persist:** Auth token survives app restart (user stays logged in)
- **Multi-host API discovery:** Supports dev (Metro on host), Android emulator (10.0.2.2), Android physical device (adb reverse), production
- **Fallback mock user:** Dev-friendly; saga catches API failure, returns dummy credentials so UI can proceed without backend
- **Separate auth routes:** `AuthNav` vs `MainNav` keeps navigation logic clear; auth state is single source of truth
