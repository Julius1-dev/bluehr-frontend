import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';

const COMPANIES_API = `${BACKEND_URL}/super-admin/companies`;
const PLANS_API = `${BACKEND_URL}/super-admin/plans`;

export default function AmendPlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const companyRes = await fetch(`${COMPANIES_API}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const companyData = await companyRes.json();
        setCompany(companyData);
        setSelectedPlan(companyData.plan);
        const plansRes = await fetch(PLANS_API, { headers: { 'Authorization': `Bearer ${token}` } });
        setPlans(await plansRes.json());
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${COMPANIES_API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan: selectedPlan })
      });
      if (!res.ok) throw new Error('Failed to amend plan');
      toast.success('Plan amended');
      navigate(-1);
    } catch (err) {
      toast.error('Failed to amend plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (!company) return <div className="text-center py-8 text-red-500">Company not found</div>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Amend Plan for {company.company_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plan</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving || !selectedPlan} className="w-full">
            {saving ? 'Saving...' : 'Save Plan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 