"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

import { UseGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdJoinClient = () => {

    const workspaceId = useWorkspaceId();
    const { data: initialValues, isLoading } = UseGetWorkspaceInfo({ workspaceId });

    if (isLoading) {
        return <PageLoader />;
    }

    if (!initialValues) {
        return <PageError message="Error in fetching Project Information!"/>;
    }

    return (

        <div className="w-full lg:max-w-xl">
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    );
};