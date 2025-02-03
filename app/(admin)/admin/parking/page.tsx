"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { PostgrestError } from "@supabase/supabase-js";

const useParkingSpaces = () => {
    const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
    const [error, setError] = useState<PostgrestError | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("parking_spaces").select("*");

            if (error) {
                setError(error);
            } else {
                setParkingSpaces(data);
            }
        };

        fetchData();
    }, []);

    return { parkingSpaces, error };
};

export default function ParkingSpacesPage() {
    const { parkingSpaces, error } = useParkingSpaces();
    const [filter, setFilter] = useState<string | null>(null);

    if (error) {
        return <div>Error loading parking spaces</div>;
    }

    const filteredSpaces = filter && filter !== "All"
        ? parkingSpaces.filter((space) => space.status === filter)
        : parkingSpaces;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Parking Spaces</h2>
                <Select onValueChange={(value) => setFilter(value)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Space Number</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSpaces?.map((space) => (
                        <TableRow key={space.id}>
                            <TableCell className="font-medium">{space.name}</TableCell>
                            <TableCell>{space.user}</TableCell>
                            <TableCell>{space.status}</TableCell>
                            <TableCell>{space.status}</TableCell>
                            <TableCell>
                                <Button>View</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
