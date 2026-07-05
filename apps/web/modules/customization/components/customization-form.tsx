import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  Form,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { VapiFormFields } from "./vapi-form-fields";
import { FormSchema } from "../types";
import { widgetSettingsSchema } from "../schemas";

type widgetSettings = Doc<"widgetSettings">;

interface CustomizationFormProps {
  initialData: widgetSettings | null;
  hasVapiPlugin: boolean;
}

export const CustomizationForm = ({ 
  initialData,
  hasVapiPlugin
}: CustomizationFormProps) => {
  const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert);
  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      greetMessage:
      initialData?.greetMessage || "Hi! How can I help you today?",
      primaryColor: initialData?.primaryColor || "#6366f1",
      defaultSuggestions: {
        suggestion1: initialData?.defaultSuggestions?.suggestion1 || "",
        suggestion2: initialData?.defaultSuggestions?.suggestion2 || "",
        suggestion3: initialData?.defaultSuggestions?.suggestion3 || "",
      },
      vapiSettings: {
        assistantId: initialData?.vapiSettings?.assistantId || "",
        phoneNumber: initialData?.vapiSettings?.phoneNumber || "",
      },
    },
  });

  const currentColor = form.watch("primaryColor") || "#6366f1";

  const onSubmit = async (values: FormSchema) => {
    try {
      const vapiSettings: widgetSettings["vapiSettings"] = {
        assistantId:
          values.vapiSettings.assistantId === "none"
            ? ""
            : values.vapiSettings.assistantId,
        phoneNumber:
          values.vapiSettings.phoneNumber === "none"
            ? ""
            : values.vapiSettings.phoneNumber,
      };

      await upsertWidgetSettings({
        greetMessage: values.greetMessage,
        primaryColor: values.primaryColor,
        defaultSuggestions: values.defaultSuggestions,
        vapiSettings: vapiSettings,
      });

      toast.success("Widget settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const COLOR_PRESETS = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Ocean Blue", hex: "#2563eb" },
    { name: "Emerald", hex: "#059669" },
    { name: "Rose", hex: "#e11d48" },
    { name: "Amber", hex: "#ea580c" },
    { name: "Obsidian", hex: "#18181b" },
    { name: "Pink", hex: "#db2777" },
    { name: "Teal", hex: "#0891b2" },
  ];

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Chat Settings</CardTitle>
            <CardDescription>
              Configure basic chat widget behavior and messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="greetMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Greeting Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Welcome message shown when chat open"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    The first message customers see when they open the chat
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="mb-4 text-sm">Default Suggestions</h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Quick reply suggestions shown to customers to help guide the
                  conversation
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultSuggestions.suggestion1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suggestion 1</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., How do I get started"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultSuggestions.suggestion2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suggestion 2</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., What are your pricing plans"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultSuggestions.suggestion3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suggestion 3</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., I need help with my account"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {hasVapiPlugin && (
          <Card>
            <CardHeader>
            <CardTitle>Voice Assistant Settings</CardTitle>
            <CardDescription>
              Configure voice calling features powered by Vapi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <VapiFormFields form={form}/>
          </CardContent>
          </Card>
        )}

        {/* Widget Brand & Color Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Widget Theme & Brand Color</CardTitle>
            <CardDescription>
              Select or customize the primary theme color for your chat widget to match your website branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Swatch grid */}
                      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => field.onChange(color.hex)}
                            className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all hover:scale-105 ${
                              field.value === color.hex
                                ? "border-primary ring-2 ring-primary/20 bg-accent"
                                : "border-transparent hover:bg-muted"
                            }`}
                          >
                            <span
                              className="size-7 rounded-full shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Hex & Native Color Picker */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                          <input
                            type="color"
                            value={field.value || "#6366f1"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="size-10 cursor-pointer rounded-lg border border-input p-1"
                          />
                        </div>
                        <Input
                          {...field}
                          value={field.value || "#6366f1"}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="#6366f1"
                          className="max-w-[160px] font-mono uppercase"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Choose a preset brand swatch or enter your website&apos;s custom HEX color code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live Interactive Preview Card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Live Widget Preview
              </span>
              <div className="mt-3 overflow-hidden rounded-lg border bg-background shadow-md max-w-sm mx-auto">
                {/* Header preview */}
                <div
                  className="p-4 text-white transition-colors duration-300"
                  style={{ backgroundColor: currentColor }}
                >
                  <p className="text-sm font-bold">Pivot Care Support</p>
                  <p className="text-xs opacity-90">
                    {form.watch("greetMessage") || "Hi! How can I help you today?"}
                  </p>
                </div>
                {/* Body Preview */}
                <div className="p-3 space-y-2 text-xs bg-muted/30">
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-none bg-accent p-2.5 max-w-[80%] text-foreground">
                      Hello! How can we assist your team today?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div
                      className="rounded-2xl rounded-tr-none p-2.5 text-white max-w-[80%] transition-colors duration-300"
                      style={{ backgroundColor: currentColor }}
                    >
                      I have a question about my order!
                    </div>
                  </div>
                </div>
                {/* Action preview */}
                <div className="p-3 border-t bg-background">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-lg text-white font-medium text-xs transition-colors duration-300"
                    style={{ backgroundColor: currentColor }}
                  >
                    Start Conversation
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Settings
            </Button>
        </div>
      </form>
    </Form>
  );
};
