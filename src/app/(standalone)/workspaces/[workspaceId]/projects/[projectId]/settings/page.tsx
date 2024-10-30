import { GetCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./settings/client";

const ProjectIdSettingsPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return <ProjectIdSettingsClient />;
};

export default ProjectIdSettingsPage;