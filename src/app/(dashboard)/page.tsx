import { redirect } from "next/navigation";

import { GetCurrent } from "@/features/auth/queries";
import { GetWorkspaces } from "@/features/workspaces/queries";

export default async function Home() {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    const workspaces = await GetWorkspaces();
    if (workspaces.total === 0) {
        redirect("/workspaces/create");
    } else {
        redirect(`/workspaces/${workspaces.documents[0].$id}`);
    }
};
