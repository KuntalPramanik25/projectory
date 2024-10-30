import Image from "next/image"
import Link from "next/link"

import { DottedSeparator } from "./dotted-separator"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { Navigation } from "./navigation"
import { Projects } from "./projects"

export const Sidebar = () => {

    return (
        
        <aside className="h-full w-full bg-neutral-100 p-4">
            <Link href="/">
                {/* <Image src="/logo.svg" alt="Logo" width={50} height={50}/>
                Jira */}
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" width={45} height={45} alt="Logo" />
                    <span className="text-2xl text-blue-700 font-bold">Projectory</span>
                </div>
            </Link>

            <DottedSeparator className="my-4" />

            <WorkspaceSwitcher />

            <DottedSeparator className="my-4" />

            <Navigation />

            <DottedSeparator className="my-4"/>

            <Projects />
        </aside>
    )
}