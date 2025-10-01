# Growlytics - Plant Care Tracker

A modern, full-stack plant care management application built with Next.js, Firebase, and Tailwind CSS.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## 🌱 Features

- **User Authentication**: Secure Firebase Authentication
- **Plant Management**: Add, edit, and track your plants
- **Care Reminders**: Automated watering, fertilizing, and pruning reminders
- **Real-time Sync**: Firebase Realtime Database for instant updates
- **Responsive Design**: Beautiful UI with Tailwind CSS and shadcn/ui
- **Task Management**: Keep track of completed and pending care tasks
- **Analytics Dashboard**: Insights into your plant care habits

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd growlytics
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy Options

- **Vercel** (Recommended): Connect your GitHub repo for automatic deployments
- **Netlify**: Drag & drop or connect via Git
- **Firebase Hosting**: Seamless integration with your Firebase project

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Auth + Realtime Database)
- **State Management**: React Context + Firebase real-time listeners
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
growlytics/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions and configurations
│   ├── firebase.ts       # Firebase configuration
│   ├── auth-context.tsx  # Authentication context
│   └── database.ts       # Database operations
└── public/               # Static assets
```

## 🔧 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Realtime Database
3. Copy your config to `.env.local`
4. Update security rules in Firebase Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app) for rapid prototyping
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
