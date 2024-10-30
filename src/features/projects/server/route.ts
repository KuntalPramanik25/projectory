import { Hono } from "hono";
import { z } from "zod";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { AppwriteDatabaseId, AppwriteImagesBucketId, AppwriteProjectsId, AppwriteTasksId } from "@/config";
import { GetMember } from "@/features/members/utils";
import { SessionMiddleware } from "@/lib/session-middleware";
import { CreateProjectSchema, UpdateProjectSchema } from "../schemas";

import { Project } from "../types";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()

    .get("/",
        SessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.valid("query");

            if (!workspaceId) {
                return c.json({ error: "Missing workspaceId." }, 401);
            }

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            const projects = await databases.listDocuments<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            );

            return c.json({ data: projects });
        }
    )

    .get("/:projectId",
        SessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                projectId
            );

            const member = await GetMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
            }

            return c.json({ data: project });
        }
    )

    .post("/",
        zValidator("form", CreateProjectSchema),
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { name, image, workspaceId } = c.req.valid("form");

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized." }, 401);
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

            const project = await databases.createDocument(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                ID.unique(),
                {
                    name,
                    imageUrl: uploadedImageUrl,
                    workspaceId
                }
            );

            return c.json({ data: project });
        }
    )
    
    .patch("/:projectId",
        zValidator("form", UpdateProjectSchema),
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { projectId } = c.req.param();
            const { name, image } = c.req.valid("form");

            const existingProject = await databases.getDocument<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                projectId
            );

            const member = await GetMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            });

            if (!member) {
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

            const project = await databases.updateDocument(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                projectId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            );

            return c.json({ data: project });
        }
    )
    
    .delete("/:projectId",
        SessionMiddleware,
        async (c) => {

            const databases = c.get("databases");
            const user = c.get("user");

            const { projectId } = c.req.param();

            const existingProject = await databases.getDocument<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                projectId
            );

            const member = await GetMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // TODO: Delete tasks

            await databases.deleteDocument(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                projectId
            );

            return c.json({ data: { $id: existingProject.$id } });
        }
    )
    
    .get("/:projectId/analytics",
        SessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                projectId
            );

            const member = await GetMember({
                databases,
                workspaceId: project.workspaceId,
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
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthAssignedTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.Closed),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthIncompleteTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.Closed),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthCompletedTasks = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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