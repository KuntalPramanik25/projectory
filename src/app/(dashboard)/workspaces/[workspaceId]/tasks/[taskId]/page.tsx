import { GetCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import { TaskIdClient } from './client';

const TaskIdPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return <TaskIdClient />;
};

export default TaskIdPage;