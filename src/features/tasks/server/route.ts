import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { SessionMiddleware } from "@/lib/session-middleware";

import { CreateTaskSchema } from "../schemas";
import { GetMember } from "@/features/members/utils";
import { AppwriteDatabaseId, AppwriteMembersId, AppwriteProjectsId, AppwriteTasksId } from "@/config";
import { ID, Query } from "node-appwrite";
import { string, z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";

const app = new Hono()

    .get("/",
        SessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),
                assigneeId: z.string().nullish(),
                status: z.nativeEnum(TaskStatus).nullish(),
                search: z.string().nullish(),
                dueDate: z.string().nullish()
            })
        ),
        async (c) => {

            const { users } = await createAdminClient();
            const user = c.get("user");
            const databases = c.get("databases");

            const { status, workspaceId, projectId, search, dueDate, assigneeId } = c.req.valid("query");

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized!" }, 401);
            }

            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt")
            ];

            if (projectId) {
                console.log ("projectId : ", projectId);
                query.push(Query.equal("projectId", projectId))
            }

            if (status) {
                console.log ("status : ", status);
                query.push(Query.equal("status", status))
            }

            if (assigneeId) {
                console.log ("assigneeId : ", assigneeId);
                query.push(Query.equal("assigneeId", assigneeId))
            }

            if (dueDate) {
                console.log ("dueDate : ", dueDate);
                query.push(Query.equal("dueDate", dueDate))
            }

            if (search) {
                console.log ("search : ", search);
                query.push(Query.search("name", search))
            }

            const tasks = await databases.listDocuments<Task>(
                AppwriteDatabaseId,
                AppwriteTasksId,
                query
            );

            const ProjectIds = tasks.documents.map((task) => task.projectId);
            const AssigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                ProjectIds.length> 0 ? [ Query.contains("$id", ProjectIds) ] : []
            );

            const members = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteMembersId,
                AssigneeIds.length> 0 ? [ Query.contains("$id", AssigneeIds) ] : []
            );

            const assignees = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email
                    };
                })
            );

            const populatedTasks = tasks.documents.map((task) => {
                const project = projects.documents.find((project) => project.$id === task.projectId);
                const assignee = assignees.find((assignee) => assignee.$id === task.assigneeId);

                return {
                    ...task,
                    project,
                    assignee
                };
            });

            return c.json({
                data: {
                    ...tasks,
                    documents: populatedTasks
                }
            });
        }
    )

    .post("/",
        SessionMiddleware,
        zValidator("json", CreateTaskSchema),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { name, status, workspaceId, projectId, dueDate, assigneeId } = c.req.valid("json");

            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized!" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1)
                ]
            );

            const newPosition = highestPositionTask.documents.length > 0
                                ? highestPositionTask.documents[0].position + 1000
                                : 1000;

            const task = await databases.createDocument(
                AppwriteDatabaseId,
                AppwriteTasksId,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    position: newPosition
                }
            );

            return c.json({ data: task });
        }
    )

    .get("/:taskId",
        SessionMiddleware,
        async (c) => {

            const currentUser = c.get("user");
            const databases = c.get("databases");

            const { users } = await createAdminClient();

            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                AppwriteDatabaseId,
                AppwriteTasksId,
                taskId
            );

            const currentMember = await GetMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id
            });

            if (!currentMember) {
                return c.json({ error: "Unauthorized to edit Task!" }, 401);
            }

            const project = await databases.getDocument<Project>(
                AppwriteDatabaseId,
                AppwriteProjectsId,
                task.projectId
            );

            const member = await databases.getDocument(
                AppwriteDatabaseId,
                AppwriteMembersId,
                task.assigneeId
            );

            const user = await users.get(member.userId);

            const assignee = {
                ...member,
                name: user.name || user.email,
                email: user.email
            };

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee
                }
            });
        }
    )

    .patch("/:taskId",
        SessionMiddleware,
        zValidator("json", CreateTaskSchema.partial()),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { taskId } = c.req.param();
            const { name, status, description, projectId, dueDate, assigneeId } = c.req.valid("json");

            const currentTask = await databases.getDocument<Task>(
                AppwriteDatabaseId,
                AppwriteTasksId,
                taskId
            )

            const member = await GetMember({
                databases,
                workspaceId: currentTask.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized to edit Task!" }, 401);
            }

            const task = await databases.updateDocument(
                AppwriteDatabaseId,
                AppwriteTasksId,
                taskId,
                {
                    name,
                    status,
                    projectId,
                    dueDate,
                    assigneeId,
                    description
                }
            );

            return c.json({ data: task });
        }
    )
    
    .delete("/:taskId",
        SessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                AppwriteDatabaseId,
                AppwriteTasksId,
                taskId
            );

            const member = await GetMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized to delete task!" }, 401);
            }

            await databases.deleteDocument(
                AppwriteDatabaseId,
                AppwriteTasksId,
                taskId
            );

            return c.json({ data: { $id: task.$id } });
        }
    )
    
    .post("/bulk-update",
        SessionMiddleware,
        zValidator(
            "json",
            z.object({
                tasks: z.array(
                    z.object({
                        $id: string(),
                        status: z.nativeEnum(TaskStatus),
                        position: z.number().int().positive().min(1000).max(1000000)
                    })
                )
            })
        ),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { tasks } = await c.req.valid("json");

            const tasksToUpdate = await databases.listDocuments<Task>(
                AppwriteDatabaseId,
                AppwriteTasksId,
                [Query.contains("$id", tasks.map((task) => task.$id))]
            );

            const workspaceIds = new Set(tasksToUpdate.documents.map(task => task.workspaceId));
            if (workspaceIds.size !== 1) {
                return c.json ({ error: "All Tasks must belong to the same Workspace!" });
            }

            const workspaceId = workspaceIds.values().next().value;

            if (!workspaceId) {
                return c.json({ error: "Workspace Id is required." }, 400);
            }
            
            const member = await GetMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized to modify Tasks!" }, 401);
            }

            const updatedTasks = await Promise.all(
                tasks.map(async (task) => {
                    const { $id, status, position } = task;

                    return databases.updateDocument<Task>(
                        AppwriteDatabaseId,
                        AppwriteTasksId,
                        $id,
                        { status, position }
                    )
                })
            );

            return c.json({ data: updatedTasks });
        }
    );

export default app;