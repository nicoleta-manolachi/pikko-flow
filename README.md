# Grocery app: setup

```bash
npx create-expo-app@latest grocery-app && cd grocery-app
npm run reset-project            # clears the template's example screens
# copy this folder's files over the project (app/, components/, db/, hooks/, store/, utils/, *.config.*)

npx expo install expo-sqlite expo-image-picker expo-file-system expo-status-bar \
  @react-native-community/datetimepicker react-native-gesture-handler react-native-reanimated
npm i drizzle-orm zustand
npm i -D drizzle-kit babel-plugin-inline-import

npx drizzle-kit generate         # creates ./drizzle (SQL + migrations.js). Re-run after any schema change
npx expo start --android         # Expo Go on a USB/Wi-Fi device or emulator
```

Add `"paths": { "@/*": ["./*"] }` under `compilerOptions` in tsconfig.json if the template lacks it (`"strict": true` should already be set).
For release builds, add to app.json plugins: `["expo-image-picker", { "cameraPermission": "Take photos of grocery items" }]`
Dev build instead of Expo Go: `npx expo run:android`.
