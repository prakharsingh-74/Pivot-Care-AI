"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Spinner } from "@workspace/ui/components/spinner";
import { AuthLayout } from "../layouts/auth-layout";
import { SignInView } from "../views/sign-in-view";

export const AuthGuard = ({ children }: {children: React.ReactNode}) => {
    return(
        <>
         <AuthLoading>
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Spinner className="size-8 text-muted-foreground" />
            </div>
         </AuthLoading>
         <Authenticated>
            {children}
         </Authenticated>
         <Unauthenticated>
            <AuthLayout>
                <SignInView />
            </AuthLayout>
         </Unauthenticated>
        </>
    )
}