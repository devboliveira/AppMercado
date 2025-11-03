# copilot-instructions for appMobileGestao

Quick, targeted guidance for AI coding assistants working on this repository.

- Project type: Expo React Native (TypeScript). Entry: `App.tsx` which mounts `src/routes/index.routes.tsx` inside `NavigationContainer`.
- Key commands (Windows PowerShell):
  - Install deps: `npm install`
  - Start dev server: `npm run start` (runs `expo start`)
  - Run for Android: `npm run android`  — opens Expo flow for Android
  - Run for web (useful for scanner UI): `npm run web`

- High-level architecture and responsibilities:
  - UI/pages: `src/pages/*` — each page has a paired `styles.ts` file and is typically the unit to edit for UX changes (e.g. `src/pages/login`, `src/pages/balanco`, `src/pages/scanCode`).
  - Navigation: `src/routes/index.routes.tsx` — Stack navigator with `Login` as initial route and a custom header using `themes`.
  - Shared UI tokens: `src/global/themes.tsx` — use theme colors for header and buttons.
  - Services layer: `src/services/supabase.ts` — single Supabase client used across pages for all DB ops.
  - Small components: stored under `src/componets/` (note: folder name is intentionally misspelled as `componets`).

- Data & integration patterns (concrete examples):
  - Authentication: `src/pages/login/index.tsx` queries `tbUsuarios` via `supabase.from('tbUsuarios').select('*').eq('usuario', user).eq('senha', password).single()` and stores the returned user JSON in AsyncStorage under the key `"@user"`.
  - Inventory (balanço): `src/pages/balanco/index.tsx` reads `tbProdutos` (fields used: `CODBAR`, `DESCRICAO`) and inserts/updates `tbBalanco` (fields used: `codbar`, `quantidade`, `balanco`, `descricao`). Expect `Number()` conversions for barcode values.
  - Storage keys: look for `@user` and `@selectedBalanco` in AsyncStorage when tracing state across screens.

- Platform-specific behavior:
  - Barcode scanner: `src/pages/scanCode/index.tsx` uses `html5-qrcode` on web and `expo-camera` / `CameraView` on native. When editing scanner logic, update both code paths and confirm web-specific behavior via `npm run web`.
  - Permissions: Camera and audio permissions are declared in `app.json` (android permissions present).

- Conventions & gotchas:
  - Folder `src/componets` contains smaller UI pieces — search with this spelling.
  - Pages typically export default functional components and use local `styles.ts` beside them.
  - AsyncStorage values are JSON-stringified; read code before changing keys.
  - Supabase client is created in `src/services/supabase.ts` and currently contains the anon key in-source (sensitive). Prefer environment secrets for production.
  - No test harness included; changes should be smoke-checked manually with `expo start`.

- Debugging tips specific to this repo:
  - To reproduce login flow: run `npm run start` -> open on device or simulator and use credentials present in `tbUsuarios` on the Supabase project.
  - For scanner troubleshooting, use `npm run web` to open browser devtools and inspect console messages from `html5-qrcode` (the web path logs errors frequently by design).
  - Database queries follow the Supabase pattern `.from(TABLE).select(...).eq(...).single()` — check for both `error` and `!data` when inferring failures.

- When editing or adding features, update these files as examples:
  - `src/pages/login/index.tsx` — login and AsyncStorage usage
  - `src/pages/balanco/index.tsx` — product lookup and insert/update flows
  - `src/pages/scanCode/index.tsx` & `src/componets/BarcodeScannerWrapper.tsx` — scanner integrations
  - `src/services/supabase.ts` — single source of Supabase configuration
  - `src/routes/index.routes.tsx` — navigation and header configuration

- Example snippets (copy/paste-friendly):
  - Supabase query pattern used across the app:
    `const { data, error } = await supabase.from('tbProdutos').select('*').eq('CODBAR', codNumber).single();`
  - AsyncStorage pattern:
    `await AsyncStorage.setItem("@user", JSON.stringify(data));` and `const stored = await AsyncStorage.getItem("@user");`

If anything here is unclear or you want more detail (for example, a mapping of DB schemas inferred from usage or explicit doc for the scanner code paths), tell me which area to expand and I'll update this file. 
