import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Interview } from "@/types";
import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Headings } from "./headings";
import { Loader, Trash2Icon } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { questionGenerationService } from "@/services/question-generation.service";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, { message: "Position is required" })
    .max(100, { message: "Position must be less than 100 characters" }),
  company: z
    .string()
    .min(1, { message: "Company is required" }),
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
  whyJoinUs: z
    .string()
    .min(1, { message: "Why Join Us is required" })
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      company: "",
      description: "",
      experience: null,
      techStack: "",
      whyJoinUs: "",
    },
  });
  
  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();
  
  const title = initialData?.position ? initialData?.position : "Create Mock Interview";
  const breadCrumpPage = initialData?.position ? "Edit" : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated!", description: "Changes saved successfully..." }
    : { title: "Created!", description: "New Mock Interview created..." };

  // Use the enhanced question generation service
  const generateAiResponse = async (data: FormData) => {
    try {
      return await questionGenerationService.generateQuestions(data);
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw new Error("Failed to generate interview questions. Please try again.");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      if (initialData) {
        // Update logic would go here
        const aiResult = await generateAiResponse(data);
        console.log("Data to update:", {
          ...data,
          questions: aiResult,
        });
        
        try {
          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...data,
            createdAt: serverTimestamp(),
          });
          
          toast(toastMessage.title, { description: toastMessage.description });
          navigate("/interview", { replace: true });
        } catch (firebaseError) {
          console.error("Firebase error:", firebaseError);
          toast.error("Database error: Could not update interview data");
        }

      } else {
        // Create new mock interview
        if (isValid) {
          if (!userId) {
            toast.error("You must be logged in to create a mock interview");
            return;
          }
          
          const aiResult = await generateAiResponse(data);
          
          console.log("Data to submit:", {
            ...data,
            userId,
            questions: aiResult,
          });
          
          try {
            await addDoc(collection(db, "interviews"), {
              ...data,
              userId,
              questions: aiResult,
              createdAt: serverTimestamp(),
            });
            
            toast(toastMessage.title, { description: toastMessage.description });
            navigate("/interview", { replace: true });
          } catch (firebaseError) {
            console.error("Firebase error:", firebaseError);
            toast.error("Database error: Could not save interview data");
          }
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    // Reset the form to its initial values
    if (initialData) {
      form.reset({
        position: initialData.position,
        company: initialData.company,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack ?? "",
        whyJoinUs: initialData.whyJoinUs ?? "",
      });
    } else {
      form.reset({
        position: "",
        company: "",
        description: "",
        experience: null,
        techStack: "",
        whyJoinUs: "",
      });
    }
    toast("Form Reset", { description: "Form has been reset to its initial values" });
  };

  const onDelete = async () => {
    if (!initialData?.id) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, "interviews", initialData.id));
      toast("Deleted!", { description: "Mock interview deleted successfully" });
      navigate("/interview", { replace: true });
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview. Please try again.");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        company: initialData.company,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack ?? "",
        whyJoinUs: initialData.whyJoinUs ?? "",
      });
    }
  }, [initialData, form]);

  return (
    <div className="my-4 flex-col w-full">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interview", link: "/interview" }]}
      />
      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading description={""} />
        {initialData && (
          <Button 
            size={"icon"} 
            variant={"destructive"} 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={loading}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator className="my-4" />
      <div className="my-5"></div>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md"
        >
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="text-black">Position / Role</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    className="h-12 text-black"
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
            name="company"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="text-black">Company</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    className="h-12 text-black"
                    disabled={loading}
                    placeholder="ex. Walmart"
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
                  <FormLabel className="text-black">Job Description</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-24 text-black"
                    disabled={loading}
                    placeholder="ex. We are looking for a Software Development Engineer - 1 to join our team. The ideal candidate will have a strong background in software development practices and a passion for technology."
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
                  <FormLabel className="text-black">Experience (in Years)</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12 text-black"
                    disabled={loading}
                    placeholder="ex. 2"
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
                  <FormLabel className="text-black">Tech Stacks</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-24 text-black"
                    disabled={loading}
                    placeholder="ex. React, Node.js, Express, MongoDB, AWS, Docker, Google Cloud"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whyJoinUs"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="text-black">Why Join Us?</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-24 text-black"
                    disabled={loading}
                    placeholder="ex. I am excited about the opportunity to work at Walmart because of its commitment to innovation and technology. I believe my skills in software development align well with the company's goals."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="w-full flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              size={"sm"}
              disabled={isSubmitting || loading}
              className="text-indigo-900 hover:bg-indigo-100"
              onClick={onReset}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="default"
              size={"sm"}
              disabled={isSubmitting || loading || !isValid}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? <Loader className="bg-indigo-600 text-white hover:bg-indigo-700" /> : actions}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mock interview.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};