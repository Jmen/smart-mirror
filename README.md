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
- 5-day forecast with icons
- Auto-updates every 5 minutes
- Powered by OpenWeatherMap API

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

Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
NEXT_PUBLIC_LATITUDE=your_latitude
NEXT_PUBLIC_LONGITUDE=your_longitude
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
- OpenWeatherMap API
