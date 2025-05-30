"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Edit, TrendingUp, TrendingDown, DollarSign, Target, Calendar } from "lucide-react"

interface ExpenseCategory {
  id: string
  name: string
  weeklyBudget: number
  monthlyBudget: number
  weeklySpent: number
  monthlySpent: number
}

interface WeeklyIncome {
  week: string
  amount: number
  goal: number
}

interface MonthlyReport {
  id: string
  month: string
  year: number
  totalIncome: number
  incomeGoal: number
  expenses: {
    categoryId: string
    categoryName: string
    budgeted: number
    spent: number
  }[]
  totalBudgeted: number
  totalSpent: number
  savedDate: string
}

// Helper function to safely get data from localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
    return defaultValue
  }
}

// Helper function to safely set data to localStorage
const setToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error)
  }
}

export default function ExpensesApp() {
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(() =>
    getFromLocalStorage("expenses", [
      { id: "house", name: "House", weeklyBudget: 350, monthlyBudget: 1400, weeklySpent: 0, monthlySpent: 0 },
      { id: "insurance", name: "Insurance", weeklyBudget: 125, monthlyBudget: 500, weeklySpent: 0, monthlySpent: 0 },
      { id: "car", name: "Car", weeklyBudget: 150, monthlyBudget: 600, weeklySpent: 0, monthlySpent: 0 },
      { id: "gas", name: "Gasoline", weeklyBudget: 100, monthlyBudget: 400, weeklySpent: 0, monthlySpent: 0 },
    ]),
  )

  const [weeklyIncomeGoal, setWeeklyIncomeGoal] = useState(() => getFromLocalStorage("weeklyIncomeGoal", 750))

  const [currentWeekIncome, setCurrentWeekIncome] = useState(() => getFromLocalStorage("currentWeekIncome", 0))

  const [weeklyIncomeHistory, setWeeklyIncomeHistory] = useState<WeeklyIncome[]>(() =>
    getFromLocalStorage("weeklyIncomeHistory", []),
  )

  const [editingExpense, setEditingExpense] = useState<ExpenseCategory | null>(null)
  // const [editingIncome, setEditingIncome] = useState(false)
  const [addExpenseAmount, setAddExpenseAmount] = useState("")
  const [selectedExpenseId, setSelectedExpenseId] = useState("")

  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>(() => getFromLocalStorage("monthlyReports", []))

  const [showAutoSaveMessage, setShowAutoSaveMessage] = useState(false)

  // Save to localStorage whenever state changes
  useEffect(() => {
    setToLocalStorage("expenses", expenses)
  }, [expenses])

  useEffect(() => {
    setToLocalStorage("weeklyIncomeGoal", weeklyIncomeGoal)
  }, [weeklyIncomeGoal])

  useEffect(() => {
    setToLocalStorage("currentWeekIncome", currentWeekIncome)
  }, [currentWeekIncome])

  useEffect(() => {
    setToLocalStorage("weeklyIncomeHistory", weeklyIncomeHistory)
  }, [weeklyIncomeHistory])

  useEffect(() => {
    setToLocalStorage("monthlyReports", monthlyReports)
  }, [monthlyReports])

  const getCurrentWeek = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    return startOfWeek.toLocaleDateString()
  }

  const totalWeeklyBudget = expenses.reduce((sum, exp) => sum + exp.weeklyBudget, 0)
  const totalWeeklySpent = expenses.reduce((sum, exp) => sum + exp.weeklySpent, 0)
  const totalMonthlyBudget = expenses.reduce((sum, exp) => sum + exp.monthlyBudget, 0)
  const totalMonthlySpent = expenses.reduce((sum, exp) => sum + exp.monthlySpent, 0)

  const weeklyBudgetStatus = totalWeeklySpent <= totalWeeklyBudget
  const monthlyBudgetStatus = totalMonthlySpent <= totalMonthlyBudget
  const incomeGoalStatus = currentWeekIncome >= weeklyIncomeGoal

  const addExpense = () => {
    if (!selectedExpenseId || !addExpenseAmount) return

    const amount = Number.parseFloat(addExpenseAmount)
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === selectedExpenseId
          ? { ...exp, weeklySpent: exp.weeklySpent + amount, monthlySpent: exp.monthlySpent + amount }
          : exp,
      ),
    )
    setAddExpenseAmount("")
    setSelectedExpenseId("")
  }

  const updateExpenseGoals = (expense: ExpenseCategory) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === expense.id ? expense : exp)))
    setEditingExpense(null)
  }

  const recordWeeklyIncome = () => {
    const currentWeek = getCurrentWeek()
    setWeeklyIncomeHistory((prev) => [
      ...prev.filter((w) => w.week !== currentWeek),
      { week: currentWeek, amount: currentWeekIncome, goal: weeklyIncomeGoal },
    ])
  }

  const resetWeeklyData = () => {
    setExpenses((prev) => prev.map((exp) => ({ ...exp, weeklySpent: 0 })))
    setCurrentWeekIncome(0)
  }

  const getStatusColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage <= 80) return "text-green-600"
    if (percentage <= 100) return "text-yellow-600"
    return "text-red-600"
  }

  // const getProgressColor = (spent: number, budget: number) => {
  //   const percentage = (spent / budget) * 100
  //   if (percentage <= 80) return "bg-green-500"
  //   if (percentage <= 100) return "bg-yellow-500"
  //   return "bg-red-500"
  // }

  const getMonthName = (monthIndex: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[monthIndex]
  }

  const checkAndSaveMonthlyReport = () => {
    const today = new Date()
    const isSecondOfMonth = today.getDate() === 2

    if (isSecondOfMonth) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
      // const monthKey = `${lastMonth.getFullYear()}-${lastMonth.getMonth()}`

      // Check if we already saved this month
      const existingReport = monthlyReports.find(
        (report) => report.year === lastMonth.getFullYear() && report.month === getMonthName(lastMonth.getMonth()),
      )

      if (!existingReport) {
        saveMonthlyReport(lastMonth)
        setShowAutoSaveMessage(true)
        setTimeout(() => setShowAutoSaveMessage(false), 5000)
      }
    }
  }

  const saveMonthlyReport = (reportDate: Date = new Date()) => {
    const month = getMonthName(reportDate.getMonth())
    const year = reportDate.getFullYear()

    // Calculate total income for the month (sum of all weekly income)
    const monthlyIncome = weeklyIncomeHistory
      .filter((week) => {
        const weekDate = new Date(week.week)
        return weekDate.getMonth() === reportDate.getMonth() && weekDate.getFullYear() === reportDate.getFullYear()
      })
      .reduce((sum, week) => sum + week.amount, 0)

    const newReport: MonthlyReport = {
      id: `${year}-${reportDate.getMonth()}`,
      month,
      year,
      totalIncome: monthlyIncome,
      incomeGoal: weeklyIncomeGoal * 4, // Approximate monthly goal
      expenses: expenses.map((exp) => ({
        categoryId: exp.id,
        categoryName: exp.name,
        budgeted: exp.monthlyBudget,
        spent: exp.monthlySpent,
      })),
      totalBudgeted: totalMonthlyBudget,
      totalSpent: totalMonthlySpent,
      savedDate: new Date().toISOString(),
    }

    setMonthlyReports((prev) => [...prev.filter((r) => r.id !== newReport.id), newReport])
  }

  const resetMonthlyData = () => {
    setExpenses((prev) => prev.map((exp) => ({ ...exp, monthlySpent: 0 })))
  }

  useEffect(() => {
    checkAndSaveMonthlyReport()
  }, [monthlyReports, weeklyIncomeHistory, expenses])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Expenses Tracker</h1>
          <p className="text-gray-600">Monitor your spending and achieve your financial goals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentWeekIncome}</div>
              <div className="flex items-center space-x-2">
                <Badge variant={incomeGoalStatus ? "default" : "destructive"}>Goal: ${weeklyIncomeGoal}</Badge>
                {incomeGoalStatus ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Expenses</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(totalWeeklySpent, totalWeeklyBudget)}`}>
                ${totalWeeklySpent}
              </div>
              <div className="text-xs text-muted-foreground">Budget: ${totalWeeklyBudget}</div>
              <Progress value={(totalWeeklySpent / totalWeeklyBudget) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(totalMonthlySpent, totalMonthlyBudget)}`}>
                ${totalMonthlySpent}
              </div>
              <div className="text-xs text-muted-foreground">Budget: ${totalMonthlyBudget}</div>
              <Progress value={(totalMonthlySpent / totalMonthlyBudget) * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            {/* Add Expense */}
            <Card>
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
                <CardDescription>Record a new expense for this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedExpenseId}
                      onChange={(e) => setSelectedExpenseId(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {expenses.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={addExpenseAmount}
                      onChange={(e) => setAddExpenseAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addExpense} className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">{expense.name}</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingExpense(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {expense.name} Budget</DialogTitle>
                          <DialogDescription>
                            Update your weekly and monthly budget for {expense.name}
                          </DialogDescription>
                        </DialogHeader>
                        {editingExpense && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="weekly">Weekly Budget</Label>
                              <Input
                                id="weekly"
                                type="number"
                                value={editingExpense.weeklyBudget}
                                onChange={(e) =>
                                  setEditingExpense({
                                    ...editingExpense,
                                    weeklyBudget: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="monthly">Monthly Budget</Label>
                              <Input
                                id="monthly"
                                type="number"
                                value={editingExpense.monthlyBudget}
                                onChange={(e) =>
                                  setEditingExpense({
                                    ...editingExpense,
                                    monthlyBudget: Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <Button onClick={() => updateExpenseGoals(editingExpense)} className="w-full">
                              Update Budget
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Weekly</span>
                        <span
                          className={`text-sm font-bold ${getStatusColor(expense.weeklySpent, expense.weeklyBudget)}`}
                        >
                          ${expense.weeklySpent} / ${expense.weeklyBudget}
                        </span>
                      </div>
                      <Progress value={(expense.weeklySpent / expense.weeklyBudget) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Monthly</span>
                        <span
                          className={`text-sm font-bold ${getStatusColor(expense.monthlySpent, expense.monthlyBudget)}`}
                        >
                          ${expense.monthlySpent} / ${expense.monthlyBudget}
                        </span>
                      </div>
                      <Progress value={(expense.monthlySpent / expense.monthlyBudget) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Income Tracking</CardTitle>
                <CardDescription>Track your weekly income and see if you're meeting your goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weeklyIncome">This Week's Income</Label>
                    <Input
                      id="weeklyIncome"
                      type="number"
                      placeholder="0.00"
                      value={currentWeekIncome}
                      onChange={(e) => setCurrentWeekIncome(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <Button onClick={recordWeeklyIncome} className="flex-1">
                      Record Week
                    </Button>
                    <Button onClick={resetWeeklyData} variant="outline">
                      Reset Week
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Income History</h3>
                  <div className="space-y-2">
                    {weeklyIncomeHistory.slice(-5).map((week, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Week of {week.week}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${week.amount >= week.goal ? "text-green-600" : "text-red-600"}`}>
                            ${week.amount}
                          </span>
                          <Badge variant={week.amount >= week.goal ? "default" : "destructive"}>
                            Goal: ${week.goal}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Set and adjust your income and expense goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="incomeGoal">Weekly Income Goal</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="incomeGoal"
                      type="number"
                      value={weeklyIncomeGoal}
                      onChange={(e) => setWeeklyIncomeGoal(Number.parseFloat(e.target.value) || 0)}
                    />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Weekly Totals</h4>
                      <p className="text-blue-700">Budget: ${totalWeeklyBudget}</p>
                      <p className="text-blue-700">Spent: ${totalWeeklySpent}</p>
                      <p className={`font-bold ${weeklyBudgetStatus ? "text-green-600" : "text-red-600"}`}>
                        {weeklyBudgetStatus ? "On Track" : "Over Budget"}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900">Monthly Totals</h4>
                      <p className="text-purple-700">Budget: ${totalMonthlyBudget}</p>
                      <p className="text-purple-700">Spent: ${totalMonthlySpent}</p>
                      <p className={`font-bold ${monthlyBudgetStatus ? "text-green-600" : "text-red-600"}`}>
                        {monthlyBudgetStatus ? "On Track" : "Over Budget"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {showAutoSaveMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <strong>Monthly Report Saved!</strong> Your previous month's progress has been automatically saved.
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress Reports</CardTitle>
                <CardDescription>Automatic monthly summaries saved on the 2nd of each month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button onClick={() => saveMonthlyReport()} variant="outline">
                    Save Current Month Manually
                  </Button>
                  <Button onClick={resetMonthlyData} variant="outline">
                    Reset Monthly Data
                  </Button>
                </div>

                {monthlyReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No monthly reports yet. Reports are automatically saved on the 2nd of each month.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlyReports
                      .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))
                      .map((report) => {
                        const incomeSuccess = report.totalIncome >= report.incomeGoal
                        const budgetSuccess = report.totalSpent <= report.totalBudgeted
                        const overallSuccess = incomeSuccess && budgetSuccess

                        return (
                          <Card
                            key={report.id}
                            className={`border-l-4 ${overallSuccess ? "border-l-green-500" : "border-l-red-500"}`}
                          >
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                  {report.month} {report.year}
                                </CardTitle>
                                <Badge variant={overallSuccess ? "default" : "destructive"}>
                                  {overallSuccess ? "Goals Met" : "Goals Missed"}
                                </Badge>
                              </div>
                              <CardDescription>
                                Saved on {new Date(report.savedDate).toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Income Summary */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <h4 className="font-semibold text-blue-900 mb-2">Income Performance</h4>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span>Goal:</span>
                                      <span className="font-medium">${report.incomeGoal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Actual:</span>
                                      <span
                                        className={`font-bold ${incomeSuccess ? "text-green-600" : "text-red-600"}`}
                                      >
                                        ${report.totalIncome}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Difference:</span>
                                      <span
                                        className={`font-bold ${incomeSuccess ? "text-green-600" : "text-red-600"}`}
                                      >
                                        ${report.totalIncome - report.incomeGoal}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <h4 className="font-semibold text-purple-900 mb-2">Expense Performance</h4>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span>Budget:</span>
                                      <span className="font-medium">${report.totalBudgeted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Spent:</span>
                                      <span
                                        className={`font-bold ${budgetSuccess ? "text-green-600" : "text-red-600"}`}
                                      >
                                        ${report.totalSpent}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Remaining:</span>
                                      <span
                                        className={`font-bold ${budgetSuccess ? "text-green-600" : "text-red-600"}`}
                                      >
                                        ${report.totalBudgeted - report.totalSpent}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Category Breakdown */}
                              <div>
                                <h4 className="font-semibold mb-3">Category Breakdown</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {report.expenses.map((expense) => {
                                    const categorySuccess = expense.spent <= expense.budgeted
                                    const percentage = (expense.spent / expense.budgeted) * 100

                                    return (
                                      <div key={expense.categoryId} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium">{expense.categoryName}</span>
                                          <Badge
                                            variant={categorySuccess ? "default" : "destructive"}
                                            className="text-xs"
                                          >
                                            {percentage.toFixed(0)}%
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span>${expense.spent}</span>
                                          <span className="text-gray-500">/ ${expense.budgeted}</span>
                                        </div>
                                        <Progress value={Math.min(percentage, 100)} className="h-2 mt-2" />
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
