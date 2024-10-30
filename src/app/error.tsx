"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

const CustomErrorPage = () => {

    return (

        <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
            <AlertTriangle className="size-10 text-red-600" />

            <p className="font-bold text-red-600">
                Oops! Something went wrong.
            </p>

            <p className="text-sm text-muted-foreground ">
                Try to refresh the page or Sign In again. If the problem still persists, please contact to our support team. 
            </p>

            <Button variant="secondary" size="sm">
                <Link href="/">
                    Back to Home
                </Link>
            </Button>
        </div>
    );
};

export default CustomErrorPage;