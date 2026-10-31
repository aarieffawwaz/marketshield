# MarketShield resident app

Flutter app for residents near active volcanoes: adaptive home for PVMBG levels I–IV, hazard map and evacuation route (flutter_map), hoax check, Kit Siaga with price-cap anchors, nearest aid posts and hold-to-send SOS. Indonesian and English.

```bash
flutter pub get
flutter run                     # device or emulator
flutter run -d chrome           # web
```

Deep links on web: `?screen=home|map|intel|posko|profile|sos|evac|kit`.

Release builds are produced by CI (see the [root README](../README.md)). Locally, `flutter build apk --release` falls back to the debug key unless `android/key.properties` exists.
