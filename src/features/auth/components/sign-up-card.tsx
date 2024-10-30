"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { RegisterSchema } from "../schemas";
import { UseRegister } from "../api/use-register";


export const SignUpCard = () => {

    const { mutate, isPending } = UseRegister();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        }
    });

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        mutate({ json: values });
    };

    return (
        <Card className="w-full h-full md:w-[530px] border-none shadow-none">
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
                    Sign Up
                </CardTitle>

                <CardDescription>
                    By signing up, you agree to our
                    {" "}
                    <Link href="/privacy-policy">
                        <span className="text-blue-700">Privacy Policy</span>
                    </Link>
                    {" "}
                    and
                    {" "}
                    <Link href="/terms-and-conditions">
                        <span className="text-blue-700">Terms & Conditions</span>
                    </Link>
                </CardDescription>
            </CardHeader>



            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Full Name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        <Button disabled={isPending} size="lg" className="w-full">Register</Button>
                    </form>
                </Form>
            </CardContent>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button disabled={isPending} variant="secondary" size={"lg"} className="w-full" onClick={() => signUpWithGoogle()}>
                    <FcGoogle className="mr-2 size-5" />
                    Sign up with Google
                </Button>
                <Button disabled={isPending} variant="secondary" size={"lg"} className="w-full" onClick={() => signUpWithGithub()}>
                    <FaGithub className="mr-2 size-5" />
                    Sign up with GitHub
                </Button>
            </CardContent> 

            <div className="px-7">
                <DottedSeparator /> 
            </div>

            <CardContent className="p-7 flex items-center justify-center">
                <p>Already have an Account?
                    <Link href="/sign-in">
                        <span className="text-blue-700">&nbsp;Sign In</span>
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
};