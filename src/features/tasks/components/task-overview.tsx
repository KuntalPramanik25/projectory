import { Button } from "@/components/ui/button";
import { Task, TaskStatusDescriptions } from "../types";
import { PencilIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";

interface TaskOverviewProps {
    task: Task;
};

export const TaskOverview = ({ task }: TaskOverviewProps) => {

    const statusValue = TaskStatusDescriptions[task.status];

    const { open } = useUpdateTaskModal();
    
    return (

        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">
                        Overview
                    </p>
                    <Button
                        onClick={() => open(task.$id)}
                        variant="secondary"
                        size="sm">
                            <PencilIcon className="size-4 mr-2" />
                            Edit
                    </Button>
                </div>

                <DottedSeparator className="my-4" />

                <div className="flex flex-col gap-y-4">
                    <OverviewProperty label="Assignee">
                        <MemberAvatar 
                            name={task.assignee.name}
                            className="size-6"
                        />
                        <p className="text-sm font-medium">
                            {task.assignee.name}
                        </p>
                    </OverviewProperty>

                    <OverviewProperty label="Due Date">
                        <TaskDate 
                            value={task.dueDate}
                            className="text-sm font-medium"
                        />
                    </OverviewProperty>

                    <OverviewProperty label="Status">
                        <Badge variant={task.status}>
                            {statusValue}
                        </Badge>
                    </OverviewProperty>
                </div>
            </div>
        </div>
    );
};