import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Mail, FileText, Edit, Save, X } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

// Real company info type (matches backend)
type CompanyInfo = {
  company_name: string;
  industry?: string;
  founded?: string;
  employees?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  email?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  domain?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  plan?: string;
  notes?: string;
};

const COMPANY_PROFILE_API = `${BACKEND_URL}/company-admin/company`;
const _PROFILE_API = `${BACKEND_URL}/company-admin/company-profile`;
const _LOGO_UPLOAD_API = `${BACKEND_URL}/company-admin/company-profile/logo-upload`;
const _DOCUMENTS_API = `${BACKEND_URL}/company-admin/company-profile/documents`;

export function CompanyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [editData, setEditData] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);

  // Fetch real company data on mount
  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(COMPANY_PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch company profile");
        const data = await res.json();
        setCompanyInfo(data);
        setEditData(data);
      } catch (err: any) {
        setError(err.message || "Error fetching company profile");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  // Fetch employee count in real time
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployeeCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setEmployeeCount(null);
      }
    };
    fetchEmployees();
  }, []);

  const handleEdit = () => {
    setEditData(companyInfo);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await fetch(COMPANY_PROFILE_API, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Failed to update company profile");
      const data = await res.json();
      setCompanyInfo(data);
      setEditData(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Error updating company profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(companyInfo);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const renderField = (
    label: string,
    value: string | undefined,
    name: keyof CompanyInfo,
    type = "text"
  ) => {
    if (name === "employees") {
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-500">{label}</label>
          <div className="text-foreground font-semibold">
            {employeeCount !== null ? (
              employeeCount
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        {isEditing ? (
          <Input
            type={type}
            name={name}
            value={value || ""}
            onChange={handleChange}
            className="w-full"
          />
        ) : (
          <div className="text-foreground">
            {value || <span className="text-gray-400">-</span>}
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading company profile...
      </div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!companyInfo || !editData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Company Profile</h2>
          <p className="text-gray-500">
            Manage your company information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{" "}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Company Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField(
                "Company Name",
                editData.company_name,
                "company_name"
              )}
              {renderField("Industry", editData.industry, "industry")}
              {renderField("Description", editData.description, "description")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Founded", editData.founded, "founded", "date")}
                {renderField(
                  "Number of Employees",
                  editData.employees,
                  "employees"
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField("Address", editData.address, "address")}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("City", editData.city, "city")}
                {renderField("Country", editData.country, "country")}
                {renderField(
                  "Postal Code",
                  editData.postal_code,
                  "postal_code"
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Legal */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField(
                "Contact Name",
                editData.contact_name,
                "contact_name"
              )}
              {renderField(
                "Email",
                editData.contact_email,
                "contact_email",
                "email"
              )}
              {renderField(
                "Phone",
                editData.contact_phone,
                "contact_phone",
                "tel"
              )}
              {renderField("Website", editData.domain, "domain", "text")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField("Tax ID", editData.tax_id, "tax_id")}
              {/* Documents section removed */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
