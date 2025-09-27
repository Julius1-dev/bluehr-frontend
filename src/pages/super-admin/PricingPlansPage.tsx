import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BACKEND_URL } from '@/lib/config';

type PlanType = 'monthly' | 'yearly';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerUser: number;
  type: PlanType;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const API_URL = `${BACKEND_URL}/super-admin/plans`;

const PricingPlansPage = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [_editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<PricingPlan>>({
    name: '',
    description: '',
    price: 0,
    pricePerUser: 0,
    type: 'monthly',
    features: [],
    isActive: true
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch plans');
        let data = await res.json();
        // Add Free Trial plan if not present
        if (!data.some((plan: any) => plan.name === 'Free Trial')) {
          data = [
            {
              id: 'free_trial',
              name: 'Free Trial',
              description: '7-day free trial for new companies',
              price: 0,
              price_per_user: 0,
              type: 'monthly',
              features: ['All core features for 7 days'],
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            ...data
          ];
        }
        setPlans(data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          pricePerUser: plan.price_per_user,
          type: plan.type,
          features: plan.features || [],
          isActive: plan.is_active,
          createdAt: new Date(plan.created_at),
          updatedAt: new Date(plan.updated_at)
        })));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.description || newPlan.price === undefined || newPlan.pricePerUser === undefined) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPlan.name,
          description: newPlan.description,
          price: newPlan.price,
          price_per_user: newPlan.pricePerUser,
          type: newPlan.type,
          features: newPlan.features,
          is_active: newPlan.isActive
        })
      });
      if (!res.ok) throw new Error('Failed to add plan');
      setIsCreating(false);
      setNewPlan({ name: '', description: '', price: 0, pricePerUser: 0, type: 'monthly', features: [], isActive: true });
      // Refresh
      const data = await res.json();
      setPlans(prev => [...prev, {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        pricePerUser: data.price_per_user,
        type: data.type,
        features: data.features || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const _handleUpdatePlan = async (id: string, updatedFields: Partial<PricingPlan>) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...updatedFields,
          price_per_user: updatedFields.pricePerUser,
          is_active: updatedFields.isActive
        })
      });
      if (!res.ok) throw new Error('Failed to update plan');
      const data = await res.json();
      setPlans(prev => prev.map(plan => plan.id === id ? {
        ...plan,
        ...updatedFields,
        pricePerUser: data.price_per_user,
        isActive: data.is_active,
        updatedAt: new Date(data.updated_at)
      } : plan));
      setEditingPlanId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete plan');
      setPlans(prev => prev.filter(plan => plan.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setNewPlan({
      ...newPlan,
      features: [...(newPlan.features || []), newFeature.trim()]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...(newPlan.features || [])];
    updatedFeatures.splice(index, 1);
    setNewPlan({ ...newPlan, features: updatedFeatures });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription pricing plans
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsCreating(true);
            setNewPlan({
              name: '',
              description: '',
              price: 0,
              pricePerUser: 0,
              type: 'monthly',
              features: [],
              isActive: true
            });
          }}
          className="mt-4 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Plan</CardTitle>
            <CardDescription>Fill in the details for the new pricing plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={newPlan.name || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="e.g., Enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-type">Billing Type</Label>
                <select
                  id="plan-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newPlan.type}
                  onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value as PlanType })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Input
                id="plan-description"
                value={newPlan.description || ''}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                placeholder="A brief description of the plan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-price">Base Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="base-price"
                    type="number"
                    value={newPlan.price || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                    className="pl-8"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-per-user">Price Per User</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="price-per-user"
                    type="number"
                    value={newPlan.pricePerUser || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, pricePerUser: Number(e.target.value) })}
                    className="pl-8"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button type="button" onClick={handleAddFeature}>
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {newPlan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlan}>
              <Save className="mr-2 h-4 w-4" />
              Save Plan
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.type === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(plan.pricePerUser)} per user
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewPlan({
                    ...plan,
                    features: [...plan.features]
                  });
                  setEditingPlanId(plan.id);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeletePlan(plan.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPlansPage;
