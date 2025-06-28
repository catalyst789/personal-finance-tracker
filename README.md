# Personal Finance Tracker

A full-stack personal finance tracking application with unique session spaces, built with React, Node.js, and PostgreSQL. No registration required - just start tracking instantly!

## 🚀 Features

### Core Features
- **Session-based Spaces**: Create unique finance tracking spaces without registration
- **Transaction Management**: Add, edit, and delete income/expense transactions
- **Data Visualization**: Beautiful charts and analytics using Recharts
- **Responsive Design**: Modern UI built with Material-UI
- **Real-time Updates**: Live data synchronization with React Query

### Bonus Features
- **Enhanced Visualizations**: Multiple chart types (pie, bar, line, area, composed)
- **Session Persistence**: Data persists in localStorage across browser sessions
- **Budget Management**: Set monthly budgets and track spending by category
- **Recurring Transactions**: Automate regular income/expense entries
- **Financial Health Indicators**: Get insights into your financial well-being
- **Comprehensive Testing**: Unit tests for components and API endpoints

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for UI components
- **Redux Toolkit** for state management
- **React Query** for server state management
- **React Hook Form** with Yup validation
- **Recharts** for data visualization
- **React Router** for navigation
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Supabase
- **Joi** for request validation
- **CORS** enabled for cross-origin requests

### Infrastructure
- **Docker** for containerization
- **Supabase** for database hosting
- **Vercel** for deployment (ready)

## 📦 Installation

### Prerequisites
- Node.js 18+ and Yarn
- Docker (optional)
- Supabase account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-tracker
   ```

2. **Set up environment variables**
   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   
   # Frontend (.env)
   cp frontend/.env.example frontend/.env
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   yarn install
   
   # Frontend
   cd ../frontend
   yarn install
   ```

4. **Set up database**
   ```bash
   # Run migrations
   cd backend
   yarn migrate
   
   # Seed data (optional)
   yarn seed
   ```

5. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   yarn dev
   
   # Frontend (Terminal 2)
   cd frontend
   yarn dev
   ```

6. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🗄 Database Schema

### Spaces
```sql
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id VARCHAR(255) REFERENCES spaces(space_id),
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id VARCHAR(255) REFERENCES spaces(space_id),
  monthly_budget DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Backend Deployment (Vercel)

1. **Configure Vercel**
   ```bash
   cd backend
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - `DATABASE_URL`
   - `NODE_ENV=production`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Frontend Deployment (Vercel)

1. **Configure Vercel**
   ```bash
   cd frontend
   vercel
   ```

2. **Set environment variables**
   - `VITE_API_URL` (your backend URL)

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Or build individual containers**
   ```bash
   # Backend
   cd backend
   docker build -t finance-tracker-backend .
   docker run -p 3001:3001 finance-tracker-backend
   
   # Frontend
   cd frontend
   docker build -t finance-tracker-frontend .
   docker run -p 5173:5173 finance-tracker-frontend
   ```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
yarn test
```

### Backend Tests
```bash
cd backend
yarn test
```

### E2E Tests
```bash
# Run with Playwright
yarn test:e2e
```

## 📁 Project Structure

```
finance-tracker/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── tests/              # Frontend tests
│   └── package.json
├── docker-compose.yml      # Docker configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/finance_tracker
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🎨 Customization

### Themes
The application uses Material-UI theming. Customize colors and styles in `frontend/src/theme/index.ts`.

### Charts
Chart configurations can be modified in `frontend/src/components/Charts.tsx`.

### Categories
Transaction categories can be updated in the respective components:
- `frontend/src/components/TransactionForm.tsx`
- `frontend/src/components/BudgetManager.tsx`
- `frontend/src/components/RecurringTransactions.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚀 Performance Optimizations

- **Code Splitting**: React.lazy() for route-based splitting
- **Memoization**: React.memo() for expensive components
- **Query Caching**: React Query for efficient data fetching
- **Bundle Optimization**: Vite for fast builds and HMR
- **Image Optimization**: WebP format support
- **CDN Ready**: Static assets optimized for CDN delivery

## 🔒 Security Features

- **Input Validation**: Joi schemas for API validation
- **CORS Protection**: Configured for production domains
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **HTTPS Ready**: Configured for secure deployments

## 📊 Analytics & Monitoring

The application is ready for integration with:
- **Google Analytics**: For user behavior tracking
- **Sentry**: For error monitoring
- **LogRocket**: For session replay
- **New Relic**: For performance monitoring

---

**Built with ❤️ using modern web technologies** 