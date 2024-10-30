import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { UseDeleteTask } from "../api/use-delete-task";

import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";

interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {

    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const { open } = useUpdateTaskModal();
    
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Task?",
        "This action cannot be undone.",
        "destructive"
    );

    const { mutate, isPending } = UseDeleteTask();

    const onDelete = async () => {
        const ok = await confirm();
        if (!ok) return;
        mutate({ param: { taskId: id } });
    };

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }

    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    }

    return (

        <div className="flex justify-end">
            <ConfirmDialog />

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 cursor-pointer">
                    <DropdownMenuItem
                        onClick={onOpenTask}
                        className="font-medium p-[10px] cursor-pointer">
                            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                            Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={onOpenProject}
                        className="font-medium p-[10px] cursor-pointer">
                            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                            Open Project
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => open(id)}
                        className="font-medium p-[10px] cursor-pointer">
                            <PencilIcon className="size-4 mr-2 stroke-2" />
                            Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="text-red-700 focus:text-red-700 font-medium p-[10px] cursor-pointer">
                            <TrashIcon className="size-4 mr-2 stroke-2" />
                            Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};