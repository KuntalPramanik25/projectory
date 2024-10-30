"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { UseGetProject } from "@/features/projects/api/use-get-project";
import { UpdateProjectForm } from "@/features/projects/components/update-project-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const ProjectIdSettingsClient = () => {

    const projectId = useProjectId();
    const { data: initialValues, isLoading } = UseGetProject({ projectId });

    if (isLoading) {
        return <PageLoader />;
    }

    if (!initialValues) {
        return <PageError message="Project not found!"/>;
    }

    return (

        <div className="w-full lg:max-w-xl">
            <UpdateProjectForm
                initialValues={initialValues}
            />
        </div>
    );
}