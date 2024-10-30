import Image from "next/image";
import Link from "next/link";

import { UserButton } from "@/features/auth/components/user-button";

interface StandaloneLayoutProps {
    children: React.ReactNode;
};

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
    return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px]">
                    <Link href="/">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.svg" width={45} height={45} alt="Logo" />
                        <span className="text-2xl text-blue-700 font-bold">Projectory</span>
                    </div>
                        
                    </Link>

                    <UserButton />
                </nav>
                <div className="flex flex-col items-center justify-center py-4">
                    {children}
                </div>
            </div>
        </main>
    );
};

export default StandaloneLayout;