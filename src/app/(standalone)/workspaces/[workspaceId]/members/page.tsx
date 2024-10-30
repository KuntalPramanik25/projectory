import { redirect } from "next/navigation";

import { GetCurrent } from "@/features/auth/queries";
import { MembersList } from "@/features/workspaces/components/members-list";


const WorkspaceIdMembersPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return (
        <div className="w-full lg:max-w-xl">
            <MembersList />
        </div>
    );
};

export default WorkspaceIdMembersPage;