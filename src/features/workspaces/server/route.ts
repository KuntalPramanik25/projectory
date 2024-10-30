import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { SessionMiddleware } from "@/lib/session-middleware";

import { CreateWorkspaceSchema, UpdateWorkspaceSchema } from "../schemas";
import { AppwriteDatabaseId, AppwriteImagesBucketId, AppwriteMembersId, AppwriteTasksId, AppwriteWorkspacesId } from "@/config";
import { ID, Query } from "node-appwrite";
import { InviteCode, MemberRole } from "@/features/members/types";
import { GenerateInviteCode } from "@/lib/utils";
import { GetMember } from "@/features/members/utils";
import { Workspace } from "../types";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()

    .get("/",
        SessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const members = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteMembersId,
                [Query.equal("userId", user.$id)],
            );

            if (members.total === 0) {
                return c.json({ data: { documents: [], total: 0 } });
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

            return c.json({ data: workspaces });
        }
    )

    .get("/:workspaceId",
        SessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            const workspace = await databases.getDocument<Workspace>(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                workspaceId
            );

            return c.json({ data: workspace });
        }
    )

    .get("/:workspaceId/info",
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const workspace = await databases.getDocument<Workspace>(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                workspaceId
            );

            return c.json({ 
                data: {
                    $id: workspace.$id, 
                    name: workspace.name,
                    imageUrl: workspace.imageUrl
                }
            });
        }
    )

    .post("/",
        zValidator("form", CreateWorkspaceSchema),
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { name, image } = c.req.valid("form");

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {

                const file = await storage.createFile(
                    AppwriteImagesBucketId,
                    ID.unique(),
                    image
                );

                const arrayBuffer = await storage.getFilePreview(
                    AppwriteImagesBucketId,
                    file.$id
                );

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            }

            const workspace = await databases.createDocument(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    inviteCode: GenerateInviteCode(InviteCode.SixDigits)
                }
            );

            await databases.createDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.Admin
                }
            );

            return c.json({ data: workspace });
        }
    )

    .patch("/:workspaceId",
        zValidator("form", UpdateWorkspaceSchema),
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid("form");

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.Admin) {
                return c.json({ error: "Unauthorized!" }, 401);
            }

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {

                const file = await storage.createFile(
                    AppwriteImagesBucketId,
                    ID.unique(),
                    image
                );

                const arrayBuffer = await storage.getFilePreview(
                    AppwriteImagesBucketId,
                    file.$id
                );

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            }
            else {
                uploadedImageUrl = image;
            }

            const workspace = await databases.updateDocument(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            );

            return c.json({ data: workspace });
        }
    )

    .delete("/:workspaceId",
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param()

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.Admin) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // TODO: Delete members, projects and tasks

            await databases.deleteDocument(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                workspaceId
            );

            return c.json({ data: { $id: workspaceId } });
        }
    )

    .post("/:workspaceId/reset-invite-code",
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param()

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.Admin) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const workspace = await databases.updateDocument(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                workspaceId,
                { inviteCode: GenerateInviteCode(InviteCode.SixDigits) }
            );

            return c.json({ data: workspace });
        }
    )

    .post("/:workspaceId/join",
        SessionMiddleware,
        zValidator("json", z.object({ code: z.string() })),
        async (c) => {

            const { workspaceId } = c.req.param();
            const { code } = c.req.valid("json");

            const databases = c.get("databases");
            const user = c.get("user");

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (member) {
                return c.json({ error: "Already a member of this workspace!" }, 400)
            }

            const workspace = await databases.getDocument<Workspace>(
                AppwriteDatabaseId,
                AppwriteWorkspacesId,
                workspaceId,
            );

            if (workspace.inviteCode !== code) {
                return c.json({ error: "Invalid invite code" }, 400)
            }

            await databases.createDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.Member
                }
            );

            return c.json({ data: workspace })
        }
    )
    
    .get("/:workspaceId/analytics",
        SessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now,1));
            const lastMonthEnd = endOfMonth(subMonths(now,1));

            const thisMonthTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            const thisMonthAssignedTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthAssignedTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const assignedTaskCount = thisMonthAssignedTasks.total;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

            const thisMonthIncompleteTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.Closed),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthIncompleteTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.Closed),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const incompleteTaskCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;

            const thisMonthCompletedTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.Closed),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthCompletedTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.Closed),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const completedTaskCount = thisMonthCompletedTasks.total;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;

            const thisMonthOverdueTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.Closed),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthOverdueTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.Closed),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const overdueTaskCount = thisMonthOverdueTasks.total;
            const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount,
                    assignedTaskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    incompleteTaskCount,
                    incompleteTaskDifference,
                    overdueTaskCount,
                    overdueTaskDifference
                }
            });
        }
    );

export default app;