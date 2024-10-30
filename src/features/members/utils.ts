import { Query, type Databases } from "node-appwrite";

import { AppwriteDatabaseId, AppwriteMembersId } from "@/config";

interface GetMemberProps {
    databases: Databases;
    workspaceId: string;
    userId: string;
};

export const GetMember = async ({ databases, workspaceId, userId }: GetMemberProps) => {

    const members = await databases.listDocuments(
        AppwriteDatabaseId,
        AppwriteMembersId,
        [
            Query.equal("workspaceId", workspaceId),
            Query.equal("userId", userId),
        ]
    );

    return members.documents[0];
};