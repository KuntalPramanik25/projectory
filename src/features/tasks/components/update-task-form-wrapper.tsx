import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { UseGetMembers } from "@/features/members/api/use-get-members";
import { UseGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { UpdateTaskForm } from "./update-task-form";

import { UseGetTask } from "../api/use-get-task";

interface UpdateTaskFormWrapperProps {
    onCancel: () => void;
    id: string;
};

export const UpdateTaskFormWrapper = ({ onCancel, id }: UpdateTaskFormWrapperProps) => {

    const workspaceId = useWorkspaceId();

    const { data: initialValues, isLoading: isLoadingTask } = UseGetTask({ taskId: id })

    const { data: projects, isLoading: isLoadingProjects } = UseGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = UseGetMembers({ workspaceId });

    const projectOptions = projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl
    }));

    const memberOptions = members?.documents.map((member) => ({
        id: member.$id,
        name: member.name,
    }));

    const isLoading = isLoadingMembers || isLoadingProjects || isLoadingTask;

    if (isLoading) {

        return (

            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!initialValues) return null;

    return (

        <div>
            <UpdateTaskForm 
                onCancel={onCancel}
                initialValues={initialValues}
                projectOptions={projectOptions ?? []}
                memberOptions={memberOptions ?? []}
            />
        </div>
    );
}