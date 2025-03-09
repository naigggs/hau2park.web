interface EditAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: {
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      vehicle_plate_number: string;
      role_name: string;
      phone:string
    };
  }