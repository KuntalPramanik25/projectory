import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Query } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";
import { SessionMiddleware } from "@/lib/session-middleware";
import { GetMember } from "../utils";
import { AppwriteDatabaseId, AppwriteMembersId } from "@/config";
import { Member, MemberRole } from "../types";

const app = new Hono()

    .get("/",
        SessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {

            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId } = c.req.valid("query");

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json ({ error: "Unauthorized." }, 401);
            }

            const members = await databases.listDocuments<Member>(
                AppwriteDatabaseId,
                AppwriteMembersId,
                [Query.equal("workspaceId", workspaceId)]
            );

            const populatedMembers = await Promise.all(
                members.documents.map(async (member) => {

                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email
                    };
                })
            );

            return c.json({ 
                data: { 
                    ...members,
                    documents: populatedMembers
                }
            });
        }
    )
    
    .delete("/:memberId",
        SessionMiddleware,
        async (c) => {

            const { memberId } = c.req.param();
            const user = c.get("user");
            const databases = c.get("databases");

            const memberToDelete = await databases.getDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteMembersId,
                [Query.equal("workspaceId", memberToDelete.workspaceId)]
            );

            const member = await GetMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            if (member.$id !== memberToDelete.$id && member.role !== MemberRole.Admin) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            if (allMembersInWorkspace.total === 1) {
                return c.json({ error: "Cannot delete the only member." }, 401);
            }

            await databases.deleteDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                memberId
            );

            return c.json({ data: { $id: memberToDelete.$id } });
        }
    )
    
    .patch("/:memberId",
        SessionMiddleware,
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        async (c) => {

            const { memberId } = c.req.param();
            const { role } = c.req.valid("json");
            const user = c.get("user");
            const databases = c.get("databases");

            const memberToUpdate = await databases.getDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteMembersId,
                [Query.equal("workspaceId", memberToUpdate.workspaceId)]
            );

            const member = await GetMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            if (member.role !== MemberRole.Admin) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            if (allMembersInWorkspace.total === 1) {
                return c.json({ error: "Cannot downgrade the only member." }, 401);
            }

            await databases.updateDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                memberId,
                { role }
            );

            return c.json({ data: { $id: memberToUpdate.$id } });
        }
    );

export default app;