import { useNavigate } from 'react-router-dom';

export function LeaveManagement(): JSX.Element {
  const [_activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  return (
    <div>
      {/* ... existing code ... */}
      <Button size="sm" className="gap-1" onClick={() => navigate('/admin/leave-calendar')}>
        <CalendarDays className="h-4 w-4" />
        Leave Calendar
      </Button>
      {/* ... existing code ... */}
    </div>
  );
} 