'use client';

// import { WidgetFooter } from "../components/widget-footer";
// import { WidgetHeader } from "../components/widget-header";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";

interface Props{
    organizationId: string;
}

export default function WidgetView({organizationId}: Props){
    return (
        // confirm whether or not min-h-screen is needed
        <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
            <WidgetAuthScreen/>
            {/* <WidgetFooter/> */}
        </main>
    );
}