'use client'

import { useOrganization } from "@clerk/nextjs"
import { AuthLayout } from "@/modules/auth/ui/layouts/auth-layout"
import { OrgSelectView } from "@/modules/auth/ui/components/org-select-view";

export const OrganizationGuard = ({ children }: { children: React.ReactNode }) => {
    const { organization } = useOrganization();

    if (!organization){
        return (
            <AuthLayout>
                <OrgSelectView/>
            </AuthLayout>
        )
    }
    return (
        <>
            {children}
        </>
    )
}
