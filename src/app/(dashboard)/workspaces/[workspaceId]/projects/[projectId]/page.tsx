import { redirect } from "next/navigation";

import { GetCurrent } from "@/features/auth/queries";
import { ProjectIdClient } from "./client";

const ProjectIdPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return <ProjectIdClient />;
};

export default ProjectIdPage;