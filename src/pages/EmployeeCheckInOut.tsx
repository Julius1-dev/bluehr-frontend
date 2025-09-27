import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, MapPin, StopCircle } from "lucide-react";
import axios from "axios";
import { getLocations } from "@/api/officeLocationApi";
import type { OfficeLocationData } from "@/types";
import { BACKEND_URL } from "@/lib/config";

export default function EmployeeCheckInOut() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [_checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [officeLocations, setOfficeLocations] = useState<OfficeLocationData[]>(
    []
  );
  const [_selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] =
    useState<OfficeLocationData | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [assignedShift, setAssignedShift] = useState(null);
  const [loadingShift, setLoadingShift] = useState(true);

  // Fetch office locations
  useEffect(() => {
    const fetchData = async () => {
      setLoadingShift(true);
      const token = localStorage.getItem("token");

      try {
        // 1. Fetch today's shift
        const shiftRes = await axios.get(
          `${BACKEND_URL}/employee/attendance/my-shift-today`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAssignedShift(shiftRes.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(
            "No shift assigned today:",
            err.response?.data?.error || err.message
          );
        } else {
          console.error(
            "No shift assigned today:",
            (err as Error).message || "Unknown error"
          );
        }
        setAssignedShift(null);
      } finally {
        setLoadingShift(false);
      }

      try {
        // 2. Fetch office locations
        const locationRes = await getLocations();
        setOfficeLocations(locationRes);
      } catch (err) {
        console.error("Failed to load office locations", err);
      }

      // 3. Fetch current coordinates
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Failed to get location:", err);
          alert("Location access is required to check in.");
        }
      );
    };

    fetchData();
  }, []);
  // Haversine formula to check if within radius
  function isWithinRadius(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusMeters: number
  ): boolean {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= radiusMeters;
  }

  const isWithinOffice =
    selectedLocation && currentCoords
      ? isWithinRadius(
          currentCoords.lat,
          currentCoords.lng,
          selectedLocation.latitude,
          selectedLocation.longitude,
          selectedLocation.radius
        )
      : false;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      if (checkInTime) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);

        const hours = Math.floor(diff / 3600)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((diff % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (diff % 60).toString().padStart(2, "0");

        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCheckIn = async () => {
    if (!currentCoords || !selectedLocation) return;

    const time = new Date();
    setCheckInTime(time);
    setIsCheckedIn(true);
    startTimer();

    const token = localStorage.getItem("token"); // Adjust if using cookies

    try {
      await axios.post(
        `${BACKEND_URL}/employee/attendance/clock-in`,
        {
          timestamp: time.toISOString(),
          location: {
            latitude: currentCoords.lat,
            longitude: currentCoords.lng,
            address: selectedLocation.address,
          },
          officeLocationId: selectedLocation.id, // ✅ move here
          reason: "Traffic jam",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Check-in error:", err);
    }
  };

  const handleCheckOut = async () => {
    const time = new Date();
    setCheckOutTime(time);
    setIsCheckedIn(false);
    stopTimer();

    const token = localStorage.getItem("token"); // Adjust if you store it elsewhere

    try {
      await axios.post(
        `${BACKEND_URL}/employee/attendance/clock-out`,
        {
          timestamp: time.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Check-out error:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Check-In/Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Select
              onValueChange={(id) => {
                const loc = officeLocations.find((l) => l.id.toString() === id);
                setSelectedLocationId(id);
                setSelectedLocation(loc || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select office location" />
              </SelectTrigger>
              <SelectContent>
                {officeLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedLocation && currentCoords && (
              <p className="text-sm">
                You are {isWithinOffice ? "✅ within" : "❌ outside"} the
                allowed radius of "{selectedLocation.name}"
              </p>
            )}
          </div>

          {currentCoords && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>
                Current position: Lat: {currentCoords.lat.toFixed(5)}, Lng:{" "}
                {currentCoords.lng.toFixed(5)}
              </span>
            </div>
          )}

          {isCheckedIn && checkInTime ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Checked in at: {checkInTime.toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600">
                Elapsed Time: {elapsedTime}
              </p>

              <Textarea
                placeholder="Add any notes about your shift..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Button
                onClick={handleCheckOut}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <StopCircle className="h-4 w-4" />
                Check Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCheckIn}
              className="gap-2"
              disabled={
                !isWithinOffice ||
                !selectedLocation ||
                !assignedShift ||
                loadingShift
              }
            >
              <Check className="h-4 w-4" />
              Check In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
