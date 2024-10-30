import { Loader } from "lucide-react";

export const PageLoader = () => {

    return (

        // <div className="flex items-center justify-center h-screen">
        <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
            <Loader
                className="size-6 animate-spin text-muted-foreground"
            />
        </div>
    );
};