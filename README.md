# JSON Swiss

🎯 **Professional JSON toolkit with formatting, validation, conversion, and code generation**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-jsonswiss.com-blue)](https://jsonswiss.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com/)

## ✨ Features

- **🎨 Professional JSON Editor** - Monaco Editor with syntax highlighting and IntelliSense
- **✅ Validation & Repair** - AI-powered JSON repair and validation
- **🔄 Format Conversion** - Convert between JSON, CSV, Excel, XML, YAML
- **🌲 Multiple Views** - Tree view, table view, and code editor
- **🔍 Advanced Search** - Find and replace with regex support
- **📊 JSON Comparison** - Visual diff with highlighted changes
- **⚡ Code Generation** - Generate code in 12+ programming languages
- **🌙 Dark Mode** - Beautiful light and dark themes
- **💾 Local Storage** - Auto-save your work locally
- **🚀 Blazing Fast** - Built with Next.js 15 and Turbopack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Thomaschant/jsonswiss-nextjs.git
cd jsonswiss-nextjs

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://jsonswiss.com](http://jsonswiss.com) to see the application.

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4.0 with custom design system
- **Components**: Radix UI primitives
- **Editor**: Monaco Editor
- **State**: Zustand with persistence
- **Animation**: Framer Motion
- **Testing**: Playwright
- **Deployment**: Vercel

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
│   ├── editor/         # JSON editor components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── store/              # Zustand state management
```

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/jsonswiss-nextjs)

Or deploy to any platform that supports Next.js:

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Radix UI](https://radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
