import { Models } from "node-appwrite";

export enum TaskStatus {
    Backlog = "Backlog",
    ToDo = "ToDo",
    InProgress = "InProgress",
    InReview = "InReview",
    Closed = "Closed"
};

export const TaskStatusDescriptions: { [key in TaskStatus]: string } = {
    [TaskStatus.Backlog]: "Backlog",
    [TaskStatus.ToDo]: "To Do",
    [TaskStatus.InProgress]: "In Progress",
    [TaskStatus.InReview]: "Under Review",
    [TaskStatus.Closed]: "Closed"
};

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description? : string;
};