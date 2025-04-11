import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { Interview } from "@/types"
import { CustomBreadCrumb } from "./custom-bread-crumb"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { Headings } from "./headings"
import { Trash2Icon } from "lucide-react"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

interface FormMockInterviewProps {
    initialData: Interview | null
}

const formSchema = z.object({
    position: z
        .string()
        .min(1, { message: "Position is required" })
        .max(100, { message: "Position must be less than 100 characters" }),
    company: z
        .string()
        .min(1, { message: "Company is required" })
        .max(100, { message: "Company must be less than 100 characters" }),
    description: z
        .string()
        .min(10, { message: "Description is required" }),
    experience: z.coerce
        .number()
        .min(0, { message: "Experience is required" })
        .optional()
        .nullable(),
    techStack: z
        .string()
        .min(1, { message: "Techstack is required" }),
    interviewDate: z.coerce
        .date()
        .optional()
        .nullable(),
    interviewTime: z.string().optional().nullable(),
})

type FormData = z.infer<typeof formSchema>

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            position: "",
            company: "",
            description: "",
            experience: null,
            techStack: "",
            interviewDate: null,
            interviewTime: null,
        }
    });

    const { isValid, isSubmitted } = form.formState;
    const { loading, setLoading } = useState(false);
    const { navigate } = useNavigate();
    const { userId } = useAuth();

    const title = initialData?.position ? initialData?.position : "Create Mock Interview";

    const breadCrumpPage = initialData?.position ? "Edit" : "Create";
    const actions = initialData ? "Save Changes" : "Create";
    const toastMessage = initialData
        ? { title: "Updated..!", description: "Changes saved successfully..." }
        : { title: "Created..!", description: "New Mock Interview created..." };

    useEffect(() => {
        if (initialData) {
            form.reset({
                position: initialData.position,
                company: initialData.company,
                description: initialData.description,
                experience: initialData.experience,
                techStack: initialData.techStack,
                interviewDate: initialData.interviewDate,
                interviewTime: initialData.interviewTime,
            })
        }
    }, [initialData, form]);

    return (
        <div className="my-4 flex-col w-full">
            <CustomBreadCrumb
                breadCrumbPage={breadCrumpPage}
                breadCrumpItems={[{ label: "Mock Interview", link: "/interview" }]}
            />
            <div className="mt-4 flex items-center justify-between-w-full">
                <Headings title={title} isSubHeading description={""} />

                (initialData && (
                <Button size={"icon"} variant={"ghost"} >
                    <Trash2Icon className="h-4 w-4" />
                </Button>
                ))
            </div>

            <Separator className="my-4" />

            <div className="my-5"></div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col p-8 rounded-lg items-start justify-start gap-4 bg-white shadow-md">
                    <FormField control={form.control} name={"position"} render={({ field }) => (
                        <FormItem className="w-full space-y-4">
                            <div className="w-full flex items-center justify-between">
                                <FormLabel>Job Role / Position</FormLabel>
                                <FormMessage
                                    className="text-sm" />
                            </div>
                            <FormControl className="w-full">
                                <Input
                                    className="h-8"
                                    disabled={loading}
                                    placeholder="ex. Software Development Engineer - 1"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Job Description</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Textarea
                                        className="h-8"
                                        disabled={loading}
                                        placeholder="ex. We are looking for a Software Development Engineer - 1 to join our team. The ideal candidate will have some experience in software development and a strong understanding of computer science principles."
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="h-8"
                                        disabled={loading}
                                        placeholder="ex. 1"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="techStack"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Tech Stacks</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Textarea
                                        className="h-8"
                                        disabled={loading}
                                        placeholder="ex. React, Node.js, Express, MongoDB"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </FormProvider>
        </div>
    );
};
