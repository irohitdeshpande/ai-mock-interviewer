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
import { chatSession } from "@/scripts";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";

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
  const navigate = useNavigate();
  const { userId } = useAuth();
  
  const title = initialData?.position ? initialData?.position : "Create Mock Interview";
  const breadCrumpPage = initialData?.position ? "Edit" : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated!", description: "Changes saved successfully..." }
    : { title: "Created!", description: "New Mock Interview created..." };

  const cleanedResponse = (responseText: string) => {
    try {
      let cleanText = responseText.trim();
      
      // First try to find a JSON array in the response
      const arrayMatch = cleanText.match(/\[\s*\{.*\}\s*\]/s);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      
      // If that fails, try removing code blocks and parsing
      cleanText = cleanText.replace(/```json|```|`/g, "").trim();
      
      // If it's still not valid JSON, try to find array syntax within the text
      const bracketMatch = cleanText.match(/\[([\s\S]*)\]/);
      if (bracketMatch) {
        return JSON.parse(`[${bracketMatch[1]}]`);
      }
      
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("Error parsing response:", error, responseText);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  };

  const generateAiResponse = async (data: FormData) => {
    try {
      const prompt = `
As an experienced technical interviewer at ${data?.company}, create a JSON array containing 8 comprehensive interview questions with detailed answers tailored for this specific position. Include 5 technical questions that assess depth of knowledge in the specified tech stack, 2 behavioral/soft skills questions relevant to the role and team dynamics, and 1 company-specific question that evaluates cultural fit and industry knowledge.
Format the output strictly as a JSON array without any explanations or additional text:
[
  { "question": "<Question text>", "answer": "<Answer text>" },
  ...
]
Job Information:
- Position: ${data?.position}
- Company: ${data?.company}
- Description: ${data?.description}
- Experience Required: ${data?.experience} 
- Tech Stack: ${data?.techStack}
- Why Join Us: ${data?.whyJoinUs}
For technical questions:
- Create problems that directly apply ${data?.techStack} to solve challenges specific to ${data?.company}'s industry
- Include a system design question relevant to the company's scale and technical challenges
- Address performance optimization scenarios that would impact ${data?.company}'s product/service
- Include at least one debugging/troubleshooting question based on realistic situations
- Focus on demonstrating practical experience with the required technologies
For behavioral/soft skill questions:
- Assess collaboration skills in the context of ${data?.company}'s team structure
- Evaluate ability to handle priorities based on typical challenges in the role
For the company-specific question:
- Assess the candidate's understanding of ${data?.company}'s industry position, challenges, or technical direction
- Include elements from the Why Join Us section to gauge alignment with company values
Ensure all answers are detailed enough to assess both the candidate's knowledge depth and communication skills.
`;
      const aiResult = await chatSession.sendMessage(prompt);
      const responseText = aiResult.response.text();
      console.log("AI raw response:", responseText);
      
      const cleanedAiResponse = cleanedResponse(responseText);
      console.log("Cleaned response:", cleanedAiResponse);
      
      return cleanedAiResponse;
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
        toast(toastMessage.title, { description: toastMessage.description });
        navigate("/generate", { replace: true });
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
            navigate("/generate", { replace: true });
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
          <Button size={"icon"} variant={"ghost"}>
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
              type="reset"
              variant="outline"
              size={"sm"}
              disabled={isSubmitting || loading}
              className="text-black"
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="default"
              size={"sm"}
              disabled={isSubmitting || loading || !isValid}
              className="text-white"
            >
              {loading ? <Loader className="text-gray-500 animate-spin" /> : actions}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};