import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OffboardingApi } from "@/services/offboardingApi";

type OffboardingType = "resignation" | "retirement" | "other";

interface OffboardingRequestForm {
  type: OffboardingType;
  lastWorkingDay: Date | undefined;
  reason: string;
  additionalNotes: string;
  handoverNotes: string;
}

export default function OffboardingRequest() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_error, setError] = useState("");
  const [formData, setFormData] = useState<OffboardingRequestForm>({
    type: "resignation",
    lastWorkingDay: undefined,
    reason: "",
    additionalNotes: "",
    handoverNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastWorkingDay) {
      setError("Please select your last working day");
      return;
    }
    if (!formData.reason.trim()) {
      setError("Please provide a reason for offboarding");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await OffboardingApi.createEmployeeRequest({
        type: formData.type,
        lastWorkingDay: formData.lastWorkingDay,
        reason: formData.reason,
        additionalNotes: formData.additionalNotes,
        handoverNotes: formData.handoverNotes,
      });
      alert(
        "Your offboarding request has been submitted successfully. HR will review your request and get back to you soon."
      );
      navigate("/");
    } catch (_err) {
      setError("Failed to submit offboarding request. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleChange = (field: keyof OffboardingRequestForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            Submit Offboarding Request
          </h1>
          <p className="text-muted-foreground">
            Please fill out the form below to submit your offboarding request
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Offboarding Details</CardTitle>
            <CardDescription>
              Provide the details of your offboarding request
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Offboarding Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: OffboardingType) =>
                      handleChange("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">Resignation</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Last Working Day *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.lastWorkingDay && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.lastWorkingDay ? (
                          format(formData.lastWorkingDay, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.lastWorkingDay}
                        onSelect={(date) =>
                          handleChange("lastWorkingDay", date || undefined)
                        }
                        initialFocus
                        disabled={(date) => {
                          // Disable past dates
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leaving *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide the reason for your offboarding"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  required
                  minLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handoverNotes">Handover Notes</Label>
                <Textarea
                  id="handoverNotes"
                  placeholder="Provide any handover notes or information for your replacement"
                  value={formData.handoverNotes}
                  onChange={(e) =>
                    handleChange("handoverNotes", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Information</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any additional information you'd like to share"
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleChange("additionalNotes", e.target.value)
                  }
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Important Notice
                  </p>
                  <p className="text-sm text-amber-700">
                    Submitting this form will initiate your offboarding process.
                    Please ensure all your tasks are completed and handover is
                    properly done before your last working day.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.lastWorkingDay || !formData.reason || isSubmitting
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">What to Expect Next</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                  1
                </span>
                <span>Your request will be reviewed by the HR department</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                  2
                </span>
                <span>You'll receive a confirmation email with next steps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                  3
                </span>
                <span>HR will schedule an exit interview if required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                  4
                </span>
                <span>
                  Complete the offboarding checklist before your last day
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
