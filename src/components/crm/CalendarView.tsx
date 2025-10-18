import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'call' | 'deadline' | 'task';
  color: string;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Product Demo - TechCorp', date: new Date(2025, 9, 18), time: '10:00 AM', type: 'meeting', color: 'bg-blue-500' },
  { id: '2', title: 'Follow-up Call', date: new Date(2025, 9, 18), time: '2:00 PM', type: 'call', color: 'bg-green-500' },
  { id: '3', title: 'Proposal Deadline', date: new Date(2025, 9, 20), time: '5:00 PM', type: 'deadline', color: 'bg-red-500' },
  { id: '4', title: 'Team Sync', date: new Date(2025, 9, 22), time: '11:00 AM', type: 'meeting', color: 'bg-purple-500' },
  { id: '5', title: 'Contract Review', date: new Date(2025, 9, 25), time: '3:00 PM', type: 'task', color: 'bg-orange-500' },
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    return mockEvents.filter(event => 
      event.date.getDate() === day && 
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const events = getEventsForDate(day);
                const today = isToday(day);
                const selected = selectedDate?.getDate() === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`
                      aspect-square p-2 rounded-lg border cursor-pointer transition-all
                      ${today ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                      ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    `}
                  >
                    <div className={`text-sm ${today ? 'font-bold text-blue-600' : ''}`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {events.slice(0, 2).map(event => (
                        <div key={event.id} className={`h-1.5 rounded-full ${event.color}`} />
                      ))}
                      {events.length > 2 && (
                        <div className="text-xs text-gray-500">+{events.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}` : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-full ${event.color} rounded-full`} />
                      <div className="flex-1">
                        <h5 className="mb-1">{event.title}</h5>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                        <Badge className="mt-2" variant="outline">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No events scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
