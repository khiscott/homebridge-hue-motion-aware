# Homebridge Hue Motion Aware

Homebridge plugin for the new **MotionAware** zones of the Philips Hue Bridge Pro. This plugin exposes virtual motion areas (created through wireless Zigbee signal analysis between Hue lights) as native motion sensors in HomeKit.

## Features

- Exposes each MotionAware zone as a native HomeKit motion sensor.
- **Enabled characteristic**: Toggle motion detection on/off per zone directly from HomeKit. Reads and writes the `enabled` field on the Hue Bridge's `motion_area_configuration` resource, and stays in sync via the Hue EventStream. By default this uses a custom characteristic UUID so Apple Home and Siri won't confuse it with a standard power switch; set `useStandardActive` to expose it as the standard HAP `Active` characteristic instead (see [Configuration](#configuration)).

## Prerequisites

- **Philips Hue Bridge Pro** (required for MotionAware feature).
- At least 3-4 compatible Hue lights configured as a "Motion area" in the Philips Hue app.

## Installation

### From GitHub (recommended for this fork)
```bash
cd /var/lib/homebridge && sudo npm install github:khiscott/homebridge-hue-motion-aware
```

### Via Homebridge UI
1. Go to the **Plugins** tab in your Homebridge UI.
2. Search for `homebridge-hue-motion-aware` and click **Install**.

### Via Command Line
```bash
hb-service add homebridge-hue-motion-aware
```

## Configuration

The plugin can be configured via the Homebridge UI settings:

- **Hue Bridge IP**: The local IP address of your Philips Hue Bridge (e.g., `192.168.178.140`).
- **Hue API Key**: Your Philips Hue application key.
- **Expose toggle as standard Active characteristic** (`useStandardActive`, default `false`): controls which HAP characteristic backs the per-zone enable/disable toggle.

#### Enabled toggle: custom characteristic vs. standard `Active`

| | `useStandardActive: false` (default) | `useStandardActive: true` |
| --- | --- | --- |
| Characteristic | Private custom UUID (`B984A1F2-…`), `BOOL` | Standard HAP `Active` (`000000B0-…`), `UINT8` `0`/`1` |
| Apple Home / Siri | Hidden — won't appear as a power switch | Visible and controllable |
| HomeKit automations | ✅ Readable/writable | ✅ Readable/writable |
| Homebridge REST API | ✅ Readable/writable | ✅ Readable/writable |
| Home Assistant (HomeKit Controller) | Not mapped as an entity | Mapped as an entity |

Use the default if you want the toggle available to automations and the REST API while keeping it out of Apple Home. Enable `useStandardActive` if you want the toggle to show up in Apple Home or to surface in Home Assistant via the HomeKit Controller integration. The toggle's behavior is identical in both modes; only the characteristic (and its value type) changes.

### Creating an API Key (Pairing)
If you don't have an API key yet:
1. Press the link button on your Hue Bridge.
2. Within 30 seconds, send a POST request to `https://<BRIDGE_IP>/api` with body `{"devicetype":"homebridge#hue-motion-aware"}`.
3. Copy the `username` value into the **Hue API Key** field in settings.

## Debugging & Tools

The plugin includes utility scripts to test connection and monitor events. These scripts handle pairing automatically when you provide your Bridge IP.

### Test Connection & Pairing
This script tests connectivity and helps you generate an API key if you don't want to do it through Homebridge.
```bash
npm run test-connection -- <BRIDGE_IP>
```

### Real-time Motion Monitor
Monitor your MotionAware zones in real-time.
```bash
npm run debug-motion -- <BRIDGE_IP>
```

## Quality Standards

This project uses:
- **oxlint**: ultra-fast linting.
- **oxfmt**: fast code formatting.

## License
MIT
