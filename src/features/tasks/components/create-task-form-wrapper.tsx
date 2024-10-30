import { Card, CardContent } from "@/components/ui/card";
import { UseGetMembers } from "@/features/members/api/use-get-members";
import { UseGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";

interface CreateTaskFormWrapperProps {
    onCancel: () => void;
};

export const CreateTaskFormWrapper = ({ onCancel }: CreateTaskFormWrapperProps) => {

    const workspaceId = useWorkspaceId();

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

    const isLoading = isLoadingMembers || isLoadingProjects;

    if (isLoading) {

        return (

            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (

        <div>
            <CreateTaskForm 
                onCancel={onCancel}
                projectOptions={projectOptions ?? []}
                memberOptions={memberOptions ?? []}
            />
        </div>
    );
}