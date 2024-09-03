'use client'

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, MinusIcon, ArrowRightIcon, DownloadIcon, UploadIcon, CalendarIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

// Types
type Category = {
  id: string;
  name: string;
  icon: string;
};

type Account = {
  id: string;
  name: string;
  balance: number;
};

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  accountId: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
};

// Custom hooks
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

// Components
const CategoryManager: React.FC<{ categories: Category[], setCategories: (categories: Category[]) => void }> = ({ categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState('');
  const [newIcon, setNewIcon] = useState('');

  const addCategory = () => {
    if (newCategory && newIcon) {
      setCategories([...categories, { id: Date.now().toString(), name: newCategory, icon: newIcon }]);
      setNewCategory('');
      setNewIcon('');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="new-category">New Category</Label>
      <div className="flex space-x-2">
        <Input
          id="new-category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter new category"
        />
        <Input
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          placeholder="Icon (emoji)"
        />
        <Button onClick={addCategory}>Add</Button>
      </div>
    </div>
  );
};

const AccountManager: React.FC<{ accounts: Account[], setAccounts: (accounts: Account[]) => void }> = ({ accounts, setAccounts }) => {
  const [newAccount, setNewAccount] = useState('');
  const [newBalance, setNewBalance] = useState('');

  const addAccount = () => {
    if (newAccount && newBalance) {
      setAccounts([...accounts, { id: Date.now().toString(), name: newAccount, balance: parseFloat(newBalance) }]);
      setNewAccount('');
      setNewBalance('');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="new-account">New Account</Label>
      <div className="flex space-x-2">
        <Input
          id="new-account"
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          placeholder="Account name"
        />
        <Input
          type="number"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          placeholder="Initial balance"
        />
        <Button onClick={addAccount}>Add</Button>
      </div>
    </div>
  );
};

const CategoryGrid: React.FC<{ categories: Category[], selectedCategory: string, onSelectCategory: (id: string) => void }> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className="h-20 flex flex-col items-center justify-center"
        >
          <span className="text-2xl mb-1">{category.icon}</span>
          <span className="text-xs">{category.name}</span>
        </Button>
      ))}
    </div>
  );
};

const TransactionForm: React.FC<{
  categories: Category[],
  accounts: Account[],
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void,
  descriptions: string[]
}> = ({ categories, accounts, addTransaction, descriptions }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState('');
  const [recurringPeriod, setRecurringPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && categoryId && accountId && date) {
      addTransaction({
        type,
        amount: parseFloat(amount),
        categoryId,
        accountId,
        description,
        date,
        isRecurring,
        recurringDay: isRecurring ? parseInt(recurringDay) : undefined,
        recurringPeriod: isRecurring ? recurringPeriod : undefined
      });
      setAmount('');
      setDescription('');
      setDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <Button type="button" onClick={() => setType('expense')} variant={type === 'expense' ? 'default' : 'outline'}>
          <MinusIcon className="mr-2 h-4 w-4" /> Expense
        </Button>
        <Button type="button" onClick={() => setType('income')} variant={type === 'income' ? 'default' : 'outline'}>
          <PlusIcon className="mr-2 h-4 w-4" /> Income
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {categories.find(c => c.id === categoryId)?.name || "Select category"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <CategoryGrid
              categories={categories}
              selectedCategory={categoryId}
              onSelectCategory={setCategoryId}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="account">Account</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          list="descriptions"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
        <datalist id="descriptions">
          {descriptions.map((desc, index) => (
            <option key={index} value={desc} />
          ))}
        </datalist>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        <Label htmlFor="recurring">Recurring</Label>
      </div>
      {isRecurring && (
        <>
          <div className="space-y-2">
            <Label htmlFor="recurring-day">Recurring Day (1-28)</Label>
            <Input
              id="recurring-day"
              type="number"
              min="1"
              max="28"
              value={recurringDay}
              onChange={(e) => setRecurringDay(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurring-period">Recurring Period</Label>
            <Select value={recurringPeriod} onValueChange={(value) => setRecurringPeriod(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select recurring period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <Button type="submit">Add Transaction</Button>
    </form>
  );
};

const TransactionList: React.FC<{
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  period: 'all' | 'monthly' | 'yearly' | 'custom',
  customStartDate?: string,
  customEndDate?: string
}> = ({ transactions, categories, accounts, period, customStartDate, customEndDate }) => {
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    switch (period) {
      case 'monthly':
        return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
      case 'yearly':
        return transactionDate.getFullYear() === now.getFullYear();
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          return transactionDate >= start && transactionDate <= end;
        }
        return true;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-4">
      {filteredTransactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader>
            <CardTitle>{transaction.type === 'income' ? 'Income' : 'Expense'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Amount: ${transaction.amount.toFixed(2)}</p>
            <p>Category: {categories.find(c => c.id === transaction.categoryId)?.name}</p>
            <p>Account: {accounts.find(a => a.id === transaction.accountId)?.name}</p>
            <p>Description: {transaction.description}</p>
            <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
            {transaction.isRecurring && (
              <>
                <p>Recurring: {transaction.recurringPeriod}</p>
                <p>Recurring Day: {transaction.recurringDay}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const TransactionGraph: React.FC<{
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  period: 'monthly' | 'yearly' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
  stepSize: 'day' | 'week' | 'month',
  filters: {
    description?: string,
    categoryId?: string,
    accountId?: string,
    type?: 'income' | 'expense'
  }
}> = ({ transactions, categories, accounts, period, customStartDate, customEndDate, stepSize, filters }) => {
  const filteredData = useMemo(() => {
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'monthly':
        startDate.setDate(1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      case 'yearly':
        startDate = new Date(startDate.getFullYear(), 0, 1);
        endDate = new Date(startDate.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        }
        break;
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate >= startDate &&
        transactionDate <= endDate &&
        (!filters.description || t.description.includes(filters.description)) &&
        (!filters.categoryId || t.categoryId === filters.categoryId) &&
        (!filters.accountId || t.accountId === filters.accountId) &&
        (!filters.type || t.type === filters.type)
      );
    });

    const data: { date: string, amount: number }[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const amount = filteredTransactions
        .filter(t => {
          const tDate = new Date(t.date);
          switch (stepSize) {
            case 'day':
              return tDate.toDateString() === currentDate.toDateString();
            case 'week':
              const weekStart = new Date(currentDate);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              return tDate >= weekStart && tDate <= weekEnd;
            case 'month':
              return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
          }
        })
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

      data.push({
        date: currentDate.toISOString().split('T')[0],
        amount: amount
      });

      switch (stepSize) {
        case 'day':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return data;
  }, [transactions, period, customStartDate, customEndDate, stepSize, filters]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const AccountBalanceGraph: React.FC<{
  transactions: Transaction[],
  accounts: Account[],
  period: 'monthly' | 'yearly' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
  selectedAccountId?: string
}> = ({ transactions, accounts, period, customStartDate, customEndDate, selectedAccountId }) => {
  const balanceData = useMemo(() => {
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'monthly':
        startDate.setDate(1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      case 'yearly':
        startDate = new Date(startDate.getFullYear(), 0, 1);
        endDate = new Date(startDate.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        }
        break;
    }

    const relevantAccounts = selectedAccountId
      ? accounts.filter(a => a.id === selectedAccountId)
      : accounts;

    const data: { date: string, balance: number }[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const balance = relevantAccounts.reduce((sum, account) => {
        const accountTransactions = transactions.filter(t =>
          t.accountId === account.id &&
          new Date(t.date) <= currentDate
        );
        const accountBalance = accountTransactions.reduce((acc, t) =>
          acc + (t.type === 'income' ? t.amount : -t.amount),
          account.balance
        );
        return sum + accountBalance;
      }, 0);

      data.push({
        date: currentDate.toISOString().split('T')[0],
        balance: balance
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [transactions, accounts, period, customStartDate, customEndDate, selectedAccountId]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={balanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="balance" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export function App() {
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [period, setPeriod] = useState<'all' | 'monthly' | 'yearly' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [graphPeriod, setGraphPeriod] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [graphStepSize, setGraphStepSize] = useState<'day' | 'week' | 'month'>('day');
  const [graphFilters, setGraphFilters] = useState({});
  const [selectedAccountForBalance, setSelectedAccountForBalance] = useState<string | undefined>(undefined);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions([...transactions, newTransaction]);

    // Update account balance
    setAccounts(accounts.map(account => {
      if (account.id === transaction.accountId) {
        return {
          ...account,
          balance: account.balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
        };
      }
      return account;
    }));
  };

  const transferMoney = () => {
    if (fromAccount && toAccount && transferAmount) {
      const amount = parseFloat(transferAmount);
      setAccounts(accounts.map(account => {
        if (account.id === fromAccount) {
          return { ...account, balance: account.balance - amount };
        }
        if (account.id === toAccount) {
          return { ...account, balance: account.balance + amount };
        }
        return account;
      }));
      setFromAccount('');
      setToAccount('');
      setTransferAmount('');
    }
  };

  const exportData = () => {
    const data = { categories, accounts, transactions };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget_data.json';
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const data = JSON.parse(content);
          setCategories(data.categories);
          setAccounts(data.accounts);
          setTransactions(data.transactions);
        } catch (error) {
          console.error('Error parsing imported data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const uniqueDescriptions = Array.from(new Set(transactions.map(t => t.description)));

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Budget PWA</h1>
      
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="graphs">Graphs</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <TransactionForm
            categories={categories}
            accounts={accounts}
            addTransaction={addTransaction}
            descriptions={uniqueDescriptions}
          />
          <div className="space-y-2">
            <Label>View Period</Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === 'custom' && (
            <div className="flex space-x-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}
          <TransactionList
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            period={period}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
          />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManager categories={categories} setCategories={setCategories} />
        </TabsContent>
        <TabsContent value="accounts" className="space-y-4">
          <AccountManager accounts={accounts} setAccounts={setAccounts} />
          <Card>
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="from-account">From Account</Label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select from account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-account">To Account</Label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select to account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button className="mt-2" onClick={transferMoney}>
                <ArrowRightIcon className="mr-2 h-4 w-4" /> Transfer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="graphs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={graphPeriod} onValueChange={(value) => setGraphPeriod(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {graphPeriod === 'custom' && (
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Step Size</Label>
                  <Select value={graphStepSize} onValueChange={(value) => setGraphStepSize(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select step size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TransactionGraph
                  transactions={transactions}
                  categories={categories}
                  accounts={accounts}
                  period={graphPeriod}
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                  stepSize={graphStepSize}
                  filters={graphFilters}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Balance Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Account</Label>
                  <Select value={selectedAccountForBalance} onValueChange={setSelectedAccountForBalance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account (or all)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={undefined}>All Accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AccountBalanceGraph
                  transactions={transactions}
                  accounts={accounts}
                  period={graphPeriod}
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                  selectedAccountId={selectedAccountForBalance}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-2">
        <Button onClick={exportData}>
          <DownloadIcon className="mr-2 h-4 w-4" /> Export Data
        </Button>
        <label className="cursor-pointer">
          <Input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
          <Button as="span">
            <UploadIcon className="mr-2 h-4 w-4" /> Import Data
          </Button>
        </label>
      </div>
    </div>
  );
}