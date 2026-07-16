# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-07-15
- `useStandardActive: true` now exposes the enable/disable toggle as a separate HAP Switch service (`On` characteristic) instead of adding `Active` to the MotionSensor service. `Active` on a MotionSensor is non-conformant per the HAP spec and Home Assistant's HomeKit Controller silently ignored it; a dedicated Switch service maps to a controllable entity in both Apple Home and Home Assistant. A stale `Active` characteristic left on cached accessories by 1.2.0 is removed automatically. The default (`false`) mode is unchanged.

## [1.2.0] - 2026-06-27
- Added `useStandardActive` config option (default `false`) to choose which HAP characteristic backs the per-zone enable/disable toggle. When `false`, the existing private custom characteristic is used (hidden from Apple Home and Siri, still usable in HomeKit automations and the Homebridge REST API). When `true`, the standard HAP `Active` characteristic is used, making the toggle visible in Apple Home and mappable as an entity in Home Assistant via the HomeKit Controller integration.

## [1.0.11] - 2026-02-02
- Added `npm run test-connection` and `npm run debug-motion` scripts for easier debugging.
- Updated README with the new script commands.

## [1.0.10] - 2026-02-02
- Improved authentication storage: Standalone scripts now prioritize `.homebridge` directory or fall back to the home directory.
- Properly utilizes Homebridge's `api.user.storagePath()` for plugin settings.

## [1.0.9] - 2026-02-02
- Refactored authentication into a shared module used by both Homebridge and standalone scripts.
- Standalone scripts now support automatic pairing and persistent storage in the user's home directory (`~/.hue-motion-aware-auth.json`).

## [1.0.8] - 2026-02-02
- Moved debug scripts to a dedicated `scripts/` directory.
- Refactored debug scripts to handle automatic pairing and CLI arguments (Bridge IP).

## [1.0.7] - 2026-02-02
- Added automatic pairing: The plugin now polls the bridge and asks you to press the link button if no API key is found.
- Added persistent storage for the API key in the Homebridge storage directory.

## [1.0.6] - 2026-02-02
- Added `CHANGELOG.md` for better visibility in Homebridge UI.

## [1.0.5] - 2026-02-02
- Switched all documentation (README) and code comments to English.
- Updated debug tool with clearer output.

## [1.0.4] - 2026-02-02
- Added automatic cleanup of stale accessories from Homebridge cache.
- Tightened resource filtering to only include MotionAware zones.
- Improved stability of accessory UUID generation.

## [1.0.3] - 2026-02-02
- Fixed critical bug: Corrected EventStream URL for Philips Hue Bridge Pro.
- Motion updates are now correctly received and displayed in HomeKit.
- Added real-time CLI debug tool (`src/debug_log.ts`).

## [1.0.2] - 2026-02-02
- Fixed duplicated sensors by grouping convenience and security motion services.
- Improved internal service-to-accessory mapping for reliable updates.

## [1.0.1] - 2026-02-02
- Initial logic adjustments for Philips Hue Bridge Pro API V2 resources.

## [1.0.0] - 2026-02-02
- Initial release.
- Support for MotionAware zones as native HomeKit occupancy sensors.
- Real-time updates via Hue CLIP V2 EventStream.
