import { redirect } from "next/navigation";

import { GetCurrent } from "@/features/auth/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";

const TasksPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return (
        
        <div className="w-full flex flex-col">
            <TaskViewSwitcher />
        </div>
    );
};

export default TasksPage;