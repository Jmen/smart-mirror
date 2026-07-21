# Smart Mirror Display

A Next.js application that displays time, weather, and network status information.

## Features

### Clock Display
- Large 24-hour time format
- Full date display including weekday, month, day, and year
- Updates every second

### Weather Information
- Current temperature with weather icon
- "Feels like" temperature
- Daily minimum and maximum temperatures
- 7-day forecast with icons
- Today vs yesterday temperature comparison
- Chance-of-rain chart for the next 24 hours
- Auto-updates every 5 minutes
- Powered by the Open-Meteo API (free, no API key required)

### Network Status
- Connection status indicator
- Network type (4G, WiFi, etc.)
- Connection speed when available
- Real-time updates on connection changes

## Getting Started

First, install the dependencies:

```bash
npm install
```

Create a `.env.local` file in the root directory with the following variables
(defaults to central London if not set):
```
LATITUDE=your_latitude
LONGITUDE=your_longitude
```

Add the following to your `.eslintrc.json` to handle TypeScript any types:
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Open-Meteo API

## Development

This project was developed using Cursor IDE with the assistance of Claude, an AI language model by Anthropic.
