import { createClient } from "@/utils/supabase/client";
import { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface LocationStats {
  name: string;
  totalSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  activeUsers: number;
}

interface ActiveUser {
  id: number;
  name: string;
  vehicle_plate_number: string;
  entryTime: string;
  status: "Parked" | "Looking";
}

// Define the ParkingSpace interface to match the database table structure
interface ParkingSpace {
  id: number;
  name: string;
  status: string;
  confidence: number | null;
  created_at: string;
  updated_at: string;
  user: string | null;
  location: string;
  allocated_at: string | null;
  verified_by_user: boolean;
  verified_at: string | null;
  parking_end_time: string | null;
}

export const useDashboardParking = () => {
  const [locations, setLocations] = useState<LocationStats[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all parking spaces
      const { data: parkingSpacesData, error: parkingError } = await supabase
        .from("parking_spaces")
        .select("*")
        .order("id", { ascending: true });

      if (parkingError) throw parkingError;
      
      // Store the raw parking spaces data for direct access
      setParkingSpaces(parkingSpacesData);

      const { data: users, error: usersError } = await supabase
      .from("user_info")
      .select("user_id, first_name, last_name, vehicle_plate_number, email, phone");
    
      if (usersError) throw usersError;

      // Create a map of user names to user data for easy lookup
      const userMap = new Map();
      users.forEach(user => {
        const fullName = `${user.first_name} ${user.last_name}`.trim();
        userMap.set(fullName.toLowerCase(), user);
      });

      // Group parking spaces by location and calculate stats
      const locationMap = new Map<string, LocationStats>();

      parkingSpacesData.forEach((space) => {
        const locationName = space.location || "Unknown";
        const current = locationMap.get(locationName) || {
          name: locationName,
          totalSpaces: 0,
          occupiedSpaces: 0,
          reservedSpaces: 0,
          activeUsers: 0,
        };

        current.totalSpaces++;
        if (space.status === "Occupied") {
          current.occupiedSpaces++;
          if (space.user && space.user !== "None") {
            current.activeUsers++;
          }
        } else if (space.status === "Reserved") {
          current.reservedSpaces++;
          if (space.user && space.user !== "None") {
            current.activeUsers++;
          }
        }

        locationMap.set(locationName, current);
      });

      // Convert active users to the required format
      const activeUsersList = parkingSpacesData
        .filter((space) => space.user && space.user !== "None")
        .map((space) => {
          // Look up user details by name
          const userName = typeof space.user === 'string' ? space.user : "Unknown";
          const userDetails = userMap.get(userName.toLowerCase());

          return {
            id: space.id,
            name: userName,
            vehicle_plate_number: userDetails?.vehicle_plate_number || "Unknown",
            entryTime: new Date(
              space.allocated_at || space.updated_at
            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: space.verified_by_user ? "Parked" : "Looking"
          } as ActiveUser;
        });

      setLocations(Array.from(locationMap.values()));
      setActiveUsers(activeUsersList);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err as PostgrestError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let parkingChannel: RealtimeChannel;

    const setupSubscription = async () => {
      // Initial fetch
      await fetchData();

      // Set up realtime subscription
      parkingChannel = supabase
        .channel('dashboard_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'parking_spaces'
          },
          () => {
            // Refetch all data when any change occurs
            fetchData();
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Cleanup subscription when component unmounts
    return () => {
      if (parkingChannel) {
        supabase.removeChannel(parkingChannel);
      }
    };
  }, []);

  return {
    locations,
    activeUsers,
    parkingSpaces, // Expose the raw parking spaces data
    error,
    isLoading,
    refresh: fetchData
  };
};