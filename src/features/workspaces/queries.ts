import { AppwriteDatabaseId, AppwriteMembersId, AppwriteWorkspacesId } from "@/config";
import {  Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite";

export const GetWorkspaces = async () =>{

    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const members = await databases.listDocuments(
        AppwriteDatabaseId,
        AppwriteMembersId,
        [Query.equal("userId", user.$id)],
    );

    if (members.total === 0) {
        return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
        AppwriteDatabaseId,
        AppwriteWorkspacesId,
        [
            Query.orderDesc("$createdAt"),
            Query.contains("$id", workspaceIds)
        ]
    );

    return workspaces;
};