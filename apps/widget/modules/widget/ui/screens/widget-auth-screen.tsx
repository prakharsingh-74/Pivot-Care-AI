import { useForm } from 'react-hook-form'
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import{
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});

export const WidgetAuthScreen = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
    };
    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">Hi there! 👋</p>
                    <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>

            <Form {...form}>
                <form 
                    className="flex flex-1 flex-col gap-y-4 py-4"
                    onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                    className='h-10 bg-background'
                                    placeholder="e.g. John Doe"
                                    type='text'
                                    {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </>
    );
};