"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link";
import Image from "next/image";
import { LoginSchema } from "../schemas";
import { UseLogin } from "../api/use-login";


export const SignInCard = () => {

    const { mutate, isPending } = UseLogin();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        mutate({ json: values });
    };

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <div className="flex flex-col items-center justify-center text-center">
                    <Image src="/logo.svg" width={50} height={50} alt="Logo" />
                    <span className="text-3xl font-bold text-blue-700 pt-2">
                        Projectory
                    </span>
                    <p className="font-medium text-muted-foreground">
                        A modern touch for organized teamwork.
                    </p>
                </div>

                <DottedSeparator className="py-4" />

                <CardTitle className="text-2xl">
                    Welcome Back!
                </CardTitle>
            </CardHeader>



            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Email Address"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button disabled={isPending} size="lg" className="w-full">Login</Button>
                    </form>
                </Form>

            </CardContent>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button disabled={isPending} variant="secondary" size={"lg"} className="w-full" onClick={() => signUpWithGoogle()}>
                    <FcGoogle className="mr-2 size-5" />
                    Login with Google
                </Button>
                <Button disabled={isPending} variant="secondary" size={"lg"} className="w-full" onClick={() => signUpWithGithub()}>
                    <FaGithub className="mr-2 size-5" />
                    Login with GitHub
                </Button>
            </CardContent>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7 flex items-center justify-center">
                <p>Don&apos;t have an Account?
                    <Link href="/sign-up">
                        <span className="text-blue-700">&nbsp;Sign Up</span></Link>
                </p>
            </CardContent>
        </Card>
    );
};