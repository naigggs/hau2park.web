import { createClient } from "@/utils/supabase/client";

export const updateVisitorApprovalStatus = async (
  id: number,
  status: string
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visitor_approvals")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(`Error updating visitor approval to ${status}:`, error);
    return null;
  }

  return data;
};
