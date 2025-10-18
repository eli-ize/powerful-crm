import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface TimelineTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee: string;
  color: string;
  status: string;
}

const mockTasks: TimelineTask[] = [
  {
    id: '1',
    title: 'Q4 Sales Campaign',
    startDate: new Date(2025, 9, 1),
    endDate: new Date(2025, 9, 31),
    progress: 65,
    assignee: 'Sarah Johnson',
    color: 'bg-blue-500',
    status: 'In Progress',
  },
  {
    id: '2',
    title: 'Enterprise Client Onboarding',
    startDate: new Date(2025, 9, 15),
    endDate: new Date(2025, 10, 15),
    progress: 30,
    assignee: 'Michael Chen',
    color: 'bg-purple-500',
    status: 'In Progress',
  },
  {
    id: '3',
    title: 'Product Demo Series',
    startDate: new Date(2025, 9, 10),
    endDate: new Date(2025, 9, 25),
    progress: 80,
    assignee: 'Emily Davis',
    color: 'bg-green-500',
    status: 'In Progress',
  },
];

export function TimelineView() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1));
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1);

  const getTaskPosition = (task: TimelineTask) => {
    const startDay = task.startDate.getDate();
    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = getDaysInMonth(currentMonth);
    
    return {
      left: `${((startDay - 1) / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline View
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 text-sm font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days Header */}
        <div className="flex border-b mb-4 pb-2">
          {days.map(day => (
            <div key={day} className="flex-1 text-center">
              <div className="text-xs text-gray-500">{day}</div>
            </div>
          ))}
        </div>

        {/* Timeline Tasks */}
        <div className="space-y-8">
          {mockTasks.map((task, index) => {
            const position = getTaskPosition(task);
            
            return (
              <div key={task.id} className="relative">
                <div className="mb-2">
                  <h5 className="mb-1">{task.title}</h5>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{task.assignee}</span>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                </div>
                
                <div className="relative h-12 bg-gray-100 rounded-lg">
                  <div
                    className={`absolute h-full ${task.color} rounded-lg transition-all hover:opacity-80 cursor-pointer flex items-center px-3`}
                    style={position}
                  >
                    <div className="flex items-center justify-between w-full text-white text-sm">
                      <span className="font-medium truncate">{task.progress}%</span>
                      <div className="flex-1 mx-3">
                        <Progress value={task.progress} className="h-2 bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
