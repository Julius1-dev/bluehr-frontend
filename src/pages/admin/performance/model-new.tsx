import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Download, MoreVertical, Search, User, ArrowRight, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Types
interface Department {
  id: number;
  name: string;
  employees: number;
  performance: number;
  trend: 'up' | 'down';
  change: number;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  performance: number;
  lastReview: string;
  status: string;
}

// Mock data for departments
const departments: Department[] = [
  { id: 1, name: 'Engineering', performance: 82, employees: 24, trend: 'up', change: 5 },
  { id: 2, name: 'Marketing', performance: 68, employees: 12, trend: 'down', change: 3 },
  { id: 3, name: 'Sales', performance: 91, employees: 18, trend: 'up', change: 7 },
  { id: 4, name: 'HR', performance: 75, employees: 8, trend: 'up', change: 2 },
  { id: 5, name: 'Finance', performance: 87, employees: 6, trend: 'down', change: 1 },
  { id: 6, name: 'Operations', performance: 79, employees: 15, trend: 'up', change: 4 },
];

// Mock data for employees by department
const employeesByDepartment: Record<number, Employee[]> = {
  1: [
    { id: 101, name: 'John Doe', email: 'john@example.com', role: 'Senior Developer', performance: 88, lastReview: '2023-10-15', status: 'Active' },
    { id: 102, name: 'Jane Smith', email: 'jane@example.com', role: 'Team Lead', performance: 92, lastReview: '2023-11-05', status: 'Active' },
    { id: 103, name: 'Bob Johnson', email: 'bob@example.com', role: 'Developer', performance: 78, lastReview: '2023-09-22', status: 'Active' },
  ],
  2: [
    { id: 201, name: 'Alice Brown', email: 'alice@example.com', role: 'Marketing Manager', performance: 72, lastReview: '2023-10-30', status: 'Active' },
    { id: 202, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Content Specialist', performance: 65, lastReview: '2023-11-10', status: 'Active' },
  ],
  3: [
    { id: 301, name: 'David Lee', email: 'david@example.com', role: 'Sales Director', performance: 95, lastReview: '2023-11-15', status: 'Active' },
    { id: 302, name: 'Eva Garcia', email: 'eva@example.com', role: 'Account Executive', performance: 89, lastReview: '2023-11-01', status: 'Active' },
  ],
};

const PerformanceModel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get employees for the selected department
  const currentDepartmentEmployees = selectedDepartment
    ? employeesByDepartment[selectedDepartment] || []
    : [];

  // Handle department selection
  const handleDepartmentSelect = (deptId: number) => {
    setSelectedDepartment(deptId);
  };

  // Handle back to departments
  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
  };

  // Handle employee actions
  const handlePromote = (employeeId: number) => {
    console.log(`Promote employee ${employeeId}`);
    // Navigate to promote page or show modal
    navigate(`/admin/performance/promote/${employeeId}`);
  };

  const handleDemote = (employeeId: number) => {
    console.log(`Demote employee ${employeeId}`);
    // Navigate to demote page or show modal
    navigate(`/admin/performance/demote/${employeeId}`);
  };

  const handleChangeDepartment = (employeeId: number) => {
    console.log(`Change department for employee ${employeeId}`);
    // Show department change dialog
  };

  // Helper function to get performance color
  const _getPerformanceColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper function to get performance text color
  const getPerformanceTextColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Department List View
  if (!selectedDepartment) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Performance by Department</h1>
            <p className="text-muted-foreground">Select a department to view employee performance</p>
          </div>
          <div className="flex space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search departments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((dept) => (
            <Card 
              key={dept.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDepartmentSelect(dept.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <div className="flex items-center">
                    <div className="w-16 mr-2">
                      <Progress value={dept.performance} className="h-2" />
                    </div>
                    <span className={`font-medium ${getPerformanceTextColor(dept.performance)}`}>
                      {dept.performance}%
                    </span>
                  </div>
                </div>
                <CardDescription className="pt-2">
                  {dept.employees} employees • {dept.trend === 'up' ? '↑' : '↓'} {dept.change}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>View employees</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Employee List View
  const department = departments.find(d => d.id === selectedDepartment);
  const employees = currentDepartmentEmployees;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleBackToDepartments}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{department?.name} Department</h1>
          <p className="text-muted-foreground">Employee Performance</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Last Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div>{employee.name}</div>
                      <div className="text-xs text-muted-foreground">{employee.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-16 mr-2">
                      <Progress value={employee.performance} className="h-2" />
                    </div>
                    <span className={`text-sm ${getPerformanceTextColor(employee.performance)}`}>
                      {employee.performance}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(employee.lastReview), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePromote(employee.id)}>
                        Promote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDemote(employee.id)}>
                        Demote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeDepartment(employee.id)}>
                        Change Department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PerformanceModel;
