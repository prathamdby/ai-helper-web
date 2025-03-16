# AI Helper

AI Helper is a web application that uses computer vision and AI to analyze questions in real-time. It captures images, performs OCR (Optical Character Recognition) to extract text, and then uses AI models to provide responses to questions.

## Features

- Real-time image capture using device camera
- OCR text extraction from captured images
- Question analysis using multiple AI models via OpenRouter
- Responsive design for both desktop and mobile devices
- Dark mode support
- Settings configuration for API keys and model selection
- OpenGraph metadata for rich social media sharing

## Setting up OpenRouter API Key

To use the AI features, follow these steps:

1. Visit [OpenRouter Keys Page](https://openrouter.ai/keys)
2. Create an account if you haven't already
3. Click on "Create Key" and give it any name
4. Copy the generated API key value
5. Paste the key in the application's settings panel to start using AI features

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
