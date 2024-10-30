import { redirect } from 'next/navigation';

import { GetCurrent } from '@/features/auth/queries'
import { WorkspaceIdJoinClient } from './client';

const WorkspaceIdJoinPage = async () => {

    const user = await GetCurrent();
    if (!user) redirect("/sign-in");

    return <WorkspaceIdJoinClient />;
}

export default WorkspaceIdJoinPage