"use client";

import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button"
import { MobileSidebar } from "./mobile-sidebar"

const pathnameMap ={
    "tasks": {
        title: "My Tasks",
        description: "View all your Tasks here."
    },
    "projects": {
        title: "My Projects",
        description: "Monitor all your Projects and Tasks here."
    }
};

const defaultMap = {
    title: "Home",
    description: "View all your Tasks here."
}

export const Navbar = () => {

    const pathname = usePathname();
    const pathnameParts = pathname.split("/");
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

    const { title, description } = pathnameMap[pathnameKey] || defaultMap;

    return (

        <nav className="pt-6 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-bold">
                    {title}
                </h1>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>

            <MobileSidebar />
            <UserButton />
        </nav>
    )
}