"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
    children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {   

    const pathName = usePathname();
    const isSignIn = pathName === "/sign-in";

    return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.svg" width={45} height={45} alt="Logo" />
                        <span className="text-2xl text-blue-700 font-bold">Projectory</span>
                    </div>

                    { isSignIn ? (
                        <Link href="/sign-up">
                            <Button variant="secondary">Sign Up</Button>
                        </Link>
                    ) : (
                        <Link href="/sign-in">
                            <Button variant="secondary">Login</Button>
                        </Link>
                    ) }
                </nav>

                <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
                    { children }
                </div>
            </div>
        </main>
    )
};

export default AuthLayout;