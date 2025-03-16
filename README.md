# AI Helper

AI Helper is a web application that uses computer vision and AI to analyze questions in real-time. It captures images, performs OCR (Optical Character Recognition) to extract text, and then uses AI models to provide responses to questions.

## Features

- Real-time image capture using device camera
- OCR text extraction from captured images
- Question analysis using multiple AI models via OpenRouter
- Responsive design for both desktop and mobile devices
- Dark mode support
- Settings configuration for API keys and model selection
- Progressive Web App (PWA) support for offline access and native app-like experience
- OpenGraph metadata for rich social media sharing

## Setting up OpenRouter API Key

To use the AI features, follow these steps:

1. Visit [OpenRouter Keys Page](https://openrouter.ai/keys)
2. Create an account if you haven't already
3. Click on "Create Key" and give it any name
4. Copy the generated API key value
5. Paste the key in the application's settings panel to start using AI features

## Installing as PWA

#### On Desktop (Chrome, Edge, or other Chromium browsers):

1. Open the website in your browser
2. Look for the install icon (↓) in the address bar
3. Click "Install" when prompted
4. The app will install and create a desktop shortcut

#### On Android:

1. Open the website in Chrome
2. Tap the three-dot menu (⋮)
3. Select "Add to Home screen"
4. Follow the installation prompts

#### On iOS:

1. Open the website in Safari
2. Tap the share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

The PWA will now behave like a native app with its own window/instance and can be accessed from your device's app launcher or home screen.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Animation**: Framer Motion
- **API Integration**: OpenRouter for AI model access
- **Styling**: Tailwind CSS with custom components
- **SEO & Sharing**: OpenGraph protocol implementation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
