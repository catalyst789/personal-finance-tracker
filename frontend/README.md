# Personal Finance Tracker - Frontend

This is the frontend application for the Personal Finance Tracker, built with React, TypeScript, and Vite.

## 🌐 Live Application

**🎯 [View Live Application](https://personal-finances-track.netlify.app/)**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URL:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Open the application**
   - Frontend: http://localhost:5173

## 🛠 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run unit tests
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues

## 🏗 Tech Stack

- **React 18** with TypeScript
- **Material-UI** for UI components
- **Redux Toolkit** for state management
- **React Query** for server state management
- **React Hook Form** with Yup validation
- **Recharts** for data visualization
- **React Router** for navigation
- **Vite** for build tooling

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── store/          # Redux store
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── tests/              # Frontend tests
└── package.json
```

## 🚀 Deployment

This frontend is deployed on **Netlify** and is live at:
**https://personal-finances-track.netlify.app/**

### Manual Deployment

1. **Build the project**
   ```bash
   yarn build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `yarn build`
   - Set publish directory: `dist`
   - Set environment variables in Netlify dashboard

## 🧪 Testing

```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
```

### Build Configuration

The project uses Vite for building. Configuration can be found in:
- `vite.config.ts` - Main Vite configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration

## 🎨 Customization

### Themes
The application uses Material-UI theming. Customize colors and styles in `src/theme/index.ts`.

### Charts
Chart configurations can be modified in `src/components/Charts.tsx`.

---

**Part of the Personal Finance Tracker full-stack application**
