import { redirect } from "next/navigation";

import { GetCurrent } from "@/features/auth/queries";
import { SignInCard } from "@/features/auth/components/sign-in-card";

const SignInPage = async () => {

    const user = await GetCurrent();

    if (user) redirect("/");

    return <SignInCard />
}

export default SignInPage;