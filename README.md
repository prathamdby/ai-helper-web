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

## Configuration

To use the AI features, you'll need to:

1. Obtain an API key from [OpenRouter](https://openrouter.ai/)
2. Configure the key and select models in the application settings

## OpenGraph Implementation

This application implements the [OpenGraph protocol](https://ogp.me/) for rich social media sharing. When shared on platforms like Facebook, Twitter, LinkedIn, etc., the application will display:

- Title: "AI Helper - Real-time Question Analysis"
- Description: "Analyze questions in real-time using computer vision and multiple AI models"
- Image: A custom OpenGraph image
- URL: The application URL

To verify the OpenGraph implementation, you can use the included script:

```bash
node scripts/verify-og.js https://your-deployed-url.com
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
