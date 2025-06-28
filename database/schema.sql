-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id VARCHAR(255) NOT NULL REFERENCES spaces(space_id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_frequency VARCHAR(20) CHECK (recurrence_frequency IN ('weekly', 'monthly', 'yearly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id VARCHAR(255) NOT NULL REFERENCES spaces(space_id) ON DELETE CASCADE,
    monthly_budget DECIMAL(10,2) NOT NULL CHECK (monthly_budget > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(space_id)
);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id VARCHAR(255) NOT NULL REFERENCES spaces(space_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_processed DATE,
    source VARCHAR(20) DEFAULT 'dedicated' CHECK (source IN ('dedicated', 'regular_transaction')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_space_id ON transactions(space_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_space_id ON budgets(space_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_space_id ON recurring_transactions(space_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due_date ON recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active ON recurring_transactions(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 