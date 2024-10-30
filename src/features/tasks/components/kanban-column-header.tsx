import {
    CircleCheckIcon,
    CircleDashedIcon,
    CircleDotDashedIcon,
    CircleDotIcon,
    CircleIcon
} from "lucide-react";

import { TaskStatus, TaskStatusDescriptions } from "../types";

interface KanbanColumnHeaderProps {
    board: TaskStatus;
    taskCount: number;
};

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
    [TaskStatus.Backlog]: (
        <CircleDashedIcon className="size-[18px] text-pink-400" />
    ),
    [TaskStatus.ToDo]: (
        <CircleIcon className="size-[18px] text-red-400" />
    ),
    [TaskStatus.InProgress]: (
        <CircleDotDashedIcon className="size-[18px] text-yellow-400" />
    ),
    [TaskStatus.InReview]: (
        <CircleDotIcon className="size-[18px] text-blue-400" />
    ),
    [TaskStatus.Closed]: (
        <CircleCheckIcon className="size-[18px] text-emerald-400" />
    )
}

export const KanbanColumnHeader = ({ board, taskCount }: KanbanColumnHeaderProps) => {

    const icon = statusIconMap[board];
    const boardValue = TaskStatusDescriptions[board];

    return (

        <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-x-2">
                {icon}
                <h2 className="text-sm font-semibold">
                    {boardValue}
                </h2>
            </div>

            <div className="size-5 flex items-center justify-center rounded-md bg-neutral-300 text-xs text-neutral-800 font-semibold">
                {taskCount}
            </div>
        </div>
    );
};