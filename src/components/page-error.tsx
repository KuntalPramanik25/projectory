
import { AlertTriangle } from "lucide-react";

interface PageErrorProps {
    message: string;
};

export const PageError = ({ message = "Oops! Something went wrong." }: PageErrorProps) => {

    return (

        <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="size-10 text-red-600 mb-2" />

            <p className="font-bold text-red-600">
                {message}
            </p>
        </div>
    );
};