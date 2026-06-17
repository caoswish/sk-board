import { createClient } from "@/lib/supabase/server";
import SignupForm from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("name")
    .order("name", { ascending: true });

  return <SignupForm companies={companies?.map((c) => c.name) ?? []} />;
}
