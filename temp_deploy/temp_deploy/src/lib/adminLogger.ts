import { supabase } from "@/integrations/supabase/client";

export async function logAdminAction(
  email: string,
  actionType: "LOGIN" | "LOGOUT" | "UPDATE_STATUS" | "DELETE_INQUIRY" | "UPDATE_SETTINGS",
  description: string
) {
  try {
    const { error } = await supabase.from("admin_logs").insert({
      admin_email: email,
      action_type: actionType,
      description: description,
    });
    if (error) {
      console.error("Failed to log admin action:", error);
    }
  } catch (e) {
    console.error("Admin logging error:", e);
  }
}
