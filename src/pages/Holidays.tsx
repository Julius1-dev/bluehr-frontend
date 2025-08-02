import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface Holiday {
  date: Date;
  name: string;
  type: string;
  notes?: string;
}

const kenyaHolidays2025: Holiday[] = [
  {
    date: new Date(2025, 0, 1),
    name: "New Year's Day",
    type: "National Public Holiday",
    notes: "Day off"
  },
  {
    date: new Date(2025, 2, 31),
    name: "Idd‑ul‑Fitr (Eid al‑Fitr)",
    type: "Islamic Public Holiday",
    notes: "Moon-based date, may vary"
  },
  {
    date: new Date(2025, 3, 18),
    name: "Good Friday",
    type: "Christian Religious Public Holiday"
  },
  {
    date: new Date(2025, 3, 21),
    name: "Easter Monday",
    type: "Christian Public Holiday"
  },
  {
    date: new Date(2025, 4, 1),
    name: "Labour Day",
    type: "International Workers' Day Public Holiday"
  },
  {
    date: new Date(2025, 5, 1),
    name: "Madaraka Day",
    type: "National Holiday",
    notes: "Kenya's self-governance Day"
  },
  {
    date: new Date(2025, 5, 2),
    name: "Madaraka Day (observed)",
    type: "Substitute Day Off",
    notes: "Substitute day off since June 1 is a Sunday"
  },
  {
    date: new Date(2025, 5, 6),
    name: "Eid al‑Adha (Feast of Sacrifice)",
    type: "Islamic Public Holiday"
  },
  {
    date: new Date(2025, 9, 10),
    name: "Mazingira Day",
    type: "National Culture/Environment Day",
    notes: "Formerly Moi Day"
  },
  {
    date: new Date(2025, 9, 20),
    name: "Mashujaa Day",
    type: "National Holiday",
    notes: "Heroes' Day to honour contributions to independence"
  },
  {
    date: new Date(2025, 11, 12),
    name: "Jamhuri Day",
    type: "Republic/Independence Day"
  },
  {
    date: new Date(2025, 11, 25),
    name: "Christmas Day",
    type: "Christian Public Holiday"
  },
  {
    date: new Date(2025, 11, 26),
    name: "Boxing Day",
    type: "Public Holiday"
  }
];

// Sort holidays by date
const sortedHolidays = [...kenyaHolidays2025].sort((a, b) => a.date.getTime() - b.date.getTime());

// Get upcoming holidays (from today)
const today = new Date();
today.setHours(0, 0, 0, 0);

const upcomingHolidays = sortedHolidays.filter(holiday => holiday.date >= today);

export function Holidays() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kenya Public Holidays 2025</h1>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            <Clock className="mr-2 h-4 w-4" />
            Upcoming Holidays
          </TabsTrigger>
          <TabsTrigger value="all">
            <Calendar className="mr-2 h-4 w-4" />
            All Holidays
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Public Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingHolidays.length > 0 ? (
                  upcomingHolidays.map((holiday, index) => (
                    <div key={index} className="flex items-center p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center mr-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {format(holiday.date, 'd')}
                        </div>
                        <div className="text-xs text-blue-500">
                          {format(holiday.date, 'MMM')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{holiday.name}</h3>
                        <p className="text-sm text-gray-500">{holiday.type}</p>
                        {holiday.notes && (
                          <p className="text-xs text-gray-400 mt-1">{holiday.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(holiday.date, 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No upcoming holidays this year.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Public Holidays 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Holiday
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedHolidays.map((holiday, index) => (
                      <tr key={index} className={holiday.date >= today ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {format(holiday.date, 'EEEE, MMMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holiday.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {holiday.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {holiday.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Holidays;
