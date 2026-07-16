# Homebridge Hue Motion Aware

Homebridge plugin for the new **MotionAware** zones of the Philips Hue Bridge Pro. This plugin exposes virtual motion areas (created through wireless Zigbee signal analysis between Hue lights) as native motion sensors in HomeKit.

## Features

- Exposes each MotionAware zone as a native HomeKit motion sensor.
- **Enabled toggle**: Toggle motion detection on/off per zone directly from HomeKit. Reads and writes the `enabled` field on the Hue Bridge's `motion_area_configuration` resource, and stays in sync via the Hue EventStream. By default this uses a custom characteristic UUID so Apple Home and Siri won't confuse it with a standard power switch; set `useStandardActive` to expose it as a separate HAP Switch service instead (see [Configuration](#configuration)).

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

#### Enabled toggle: custom characteristic vs. standard Switch service

| | `useStandardActive: false` (default) | `useStandardActive: true` |
| --- | --- | --- |
| Placement | Private custom characteristic (`B984A1F2-…`, `BOOL`) on the motion sensor service | Separate HAP **Switch** service (`On` characteristic) on the same accessory |
| Apple Home / Siri | Hidden — won't appear as a power switch | Visible as a distinct switch tile on the accessory |
| HomeKit automations | ✅ Readable/writable | ✅ Readable/writable |
| Homebridge REST API | ✅ Readable/writable | ✅ Readable/writable |
| Home Assistant (HomeKit Controller) | Not mapped as an entity | Mapped as a controllable switch entity |

Use the default if you want the toggle available to automations and the REST API while keeping it out of Apple Home. Enable `useStandardActive` if you want the toggle to show up in Apple Home or to surface in Home Assistant via the HomeKit Controller integration. The toggle is exposed as a second Switch service (named "<zone name> Enabled") rather than a characteristic on the motion sensor itself — placing a power characteristic on a MotionSensor service is non-conformant per the HAP spec, and Home Assistant silently ignores it there. A dedicated Switch service is what makes it appear as a distinct, controllable entity. The toggle's behavior is identical in both modes.

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
