import { Models } from "node-appwrite";

export enum MemberRole {
    Admin = "Admin",
    Member = "Member"
};

export enum InviteCode {
    OneDigit = 1,
    TwoDigits = 2,
    ThreeDigits = 3,
    FourDigits = 4,
    FiveDigits = 5,
    SixDigits = 6,
    SevenDigits = 7,
    EightDigits = 8,
    NineDigits = 9,
    TenDigits = 10,
};

export type Member = Models.Document & {
    workspaceId: string;
    userId: string;
    role: MemberRole;
};