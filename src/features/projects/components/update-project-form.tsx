"use client";

import { z } from "zod";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { UpdateProjectSchema } from "../schemas";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftIcon, ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { useConfirm } from "@/hooks/use-confirm";

import { UseUpdateProject } from "../api/use-update-project";
import { UseDeleteProject } from "../api/use-delete-project";

interface UpdateProjectFormProps {
    onCancel?: () => void;
    initialValues: Project;
};

export const UpdateProjectForm = ({ onCancel, initialValues }: UpdateProjectFormProps) => {

    const router = useRouter();

    const { mutate, isPending } = UseUpdateProject();
    const { mutate: deleteProject, isPending: isDeletingProject } = UseDeleteProject();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Project?",
        "This action cannot be undone",
        "destructive"
    );

    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof UpdateProjectSchema>>({

        resolver: zodResolver(UpdateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteProject({
            param: { projectId: initialValues.$id },
        }, {
            onSuccess: () => {
                window.location.href = `/workspaces/${initialValues.workspaceId}`;
            }
        });
    };

    const onSubmit = (values: z.infer<typeof UpdateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        };

        mutate({ 
            form: finalValues, 
            param: { projectId: initialValues.$id } 
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    };

    return (

        <div className="flex flex-col gap-y-4">

            <DeleteDialog />

            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button
                        size="sm" variant="secondary"
                        onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>

                <div className="px-7">
                    <DottedSeparator />
                </div>  

                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Project Name
                                            </FormLabel>

                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Project Name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
                                                            alt="Logo"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Project Icon</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPG, PNG, SVG or JPEG. Maximum Size : 1MB.
                                                    </p>
                                                    <input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg, .jpeg, .png, .svg"
                                                        ref={inputRef}
                                                        onChange={handleImageChange}
                                                        disabled={isPending}
                                                    />
                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="tertiarydestructive"
                                                            size="xs"
                                                            className="w-fit mt-2"
                                                            onClick={() => {
                                                                field.onChange(null);
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = "";
                                                                }
                                                            }}>
                                                            <X size={15} className="mr-2" />
                                                            Remove Image
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="tertiary"
                                                            size="xs"
                                                            className="w-fit mt-2"
                                                            onClick={() => inputRef.current?.click()}>
                                                            Upload Image
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />


                            </div>

                            <DottedSeparator className="py-7" />

                            <div className="flex items-center justify-between">
                                <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={isPending}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">
                            Danger Zone
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a project is irreversible and will remove all associated data.
                        </p>
                        <DottedSeparator className="pt-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isDeletingProject}
                            onClick={handleDelete}>
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
};