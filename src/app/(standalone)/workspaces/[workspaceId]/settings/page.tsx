import { GetCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";


const WorkspaceIdSettingsPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return <WorkspaceIdSettingsClient />
};

export default WorkspaceIdSettingsPage; 