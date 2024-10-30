"use client";

import { Loader, PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DottedSeparator } from "@/components/dotted-separator";

import { DataFilters } from "./data-filters";

import { DataTable } from "./data-table";
import { Columns } from "./columns";

import { UseGetTasks } from "../api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { UseBulkUpdateTask } from "../api/use-bulk-update-task";
import { DataCalendar } from "./data-calendar";

interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean;
};

export const TaskViewSwitcher = ({ hideProjectFilter }: TaskViewSwitcherProps) => {

    const [view, setView] = useQueryState("task-view", { defaultValue: "table" });

    const workspaceId = useWorkspaceId();
    const paramProjectId = useProjectId();

    const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();
    const { data: tasks, isLoading: isLoadingTasks } = UseGetTasks({ 
        workspaceId, 
        projectId: paramProjectId || projectId, 
        assigneeId, 
        status, 
        dueDate 
    });

    const { open } = useCreateTaskModal();

    const { mutate: bulkUpdate } = UseBulkUpdateTask();

    const onKanbanChange = useCallback((tasks: { $id: string; status: TaskStatus; position: number }[]) => {

        bulkUpdate({ json: { tasks } });

    }, [bulkUpdate])

    return (

        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full border rounded-lg">
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
                            Table
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
                            Calendar
                        </TabsTrigger>
                    </TabsList>

                    <Button onClick={open} size="sm" className="w-full lg:w-auto">
                        <PlusIcon className="size-4 mr-2" />
                        New
                    </Button>
                </div>

                <DottedSeparator className="my-4" />

                <DataFilters hideProjectFilter={hideProjectFilter} />

                <DottedSeparator className="my-4" />

                {isLoadingTasks ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="table" className="mt-0">
                            <DataTable
                                columns={Columns}
                                data={tasks?.documents ?? []}
                            />
                        </TabsContent>

                        <TabsContent value="kanban" className="mt-0">
                            <DataKanban
                                data={tasks?.documents ?? []}
                                onChange={onKanbanChange}
                            />
                        </TabsContent>

                        <TabsContent value="calendar" className="mt-0 h-full pb-4">
                            <DataCalendar
                                data={tasks?.documents ?? []}
                            />
                        </TabsContent>
                    </>
                )}
            </div>
        </Tabs>
    );
}