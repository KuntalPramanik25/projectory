"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { UseJoinWorkspace } from "../api/use-join-workspace";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useInviteCode } from "../hooks/use-invite-code";

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    };
};

export const JoinWorkspaceForm = ({ initialValues }: JoinWorkspaceFormProps) => {

    const router = useRouter();
    const { mutate, isPending } = UseJoinWorkspace();
    const workspaceId = useWorkspaceId();
    const inviteCode = useInviteCode();

    const onSubmit = () => {
        mutate({
            param: { workspaceId },
            json: { code: inviteCode}
        }, {
            onSuccess: ({ data }) => {
                router.push(`/workspaces/${data.$id}`);
            }
        });
    };

    return (

        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join this <strong>{initialValues.name}</strong> workspace.
                </CardDescription>
            </CardHeader>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
                    <Button
                        variant="secondary"
                        type="button"
                        asChild
                        disabled={isPending}
                        className="w-full lg:w-fit">
                        <Link href="/">
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={isPending}
                        className="w-full lg:w-fit">
                        Join Workspace
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
};