import { Headings } from "@/components/headings"
import { InterviewPin } from "@/components/pin";
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { Separator } from "@radix-ui/react-separator";
import { query, collection, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Loader, Plus, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Dashboard = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null);
    const { userId } = useAuth();

    useEffect(() => {
        setLoading(true);
        const interviewQuery = query(
            collection(db, "interviews"),
            where("userId", "==", userId)
        );

        const unsubscribe = onSnapshot(
            interviewQuery,
            (snapshot) => {
                const interviewList: Interview[] = snapshot.docs.map((doc) => {
                    const id = doc.id;
                    return {
                        id,
                        ...doc.data(),
                    };
                }) as Interview[];
                setInterviews(interviewList);
                setLoading(false);
            },
            (error) => {
                console.log("Error on fetching : ", error);
                toast.error("Error..", {
                    description: "Something went wrong.. Try again later..",
                });
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    const handleDelete = async () => {
        if (!interviewToDelete) return;
        
        try {
            setDeleteLoading(true);
            await deleteDoc(doc(db, "interviews", interviewToDelete));
            toast.success("Deleted!", { description: "Interview deleted successfully" });
        } catch (error) {
            console.error("Error deleting interview:", error);
            toast.error("Failed to delete", { description: "Could not delete the interview. Please try again." });
        } finally {
            setDeleteLoading(false);
            setInterviewToDelete(null);
        }
    };

    // Function to create an enhanced InterviewPin with delete button
    const renderInterviewPin = (interview: Interview) => {
        return (
            <div key={interview.id} className="relative group">
                <InterviewPin interview={interview} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setInterviewToDelete(interview.id);
                        }}
                    >
                        <Trash2Icon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex w-full items-center justify-between">
                {/* heading */}
                <Headings title="Dashboard" description="Your dashboard for all your interviews" />
                <Link to={"/interview/create"}>
                    <Button size={"sm"} variant={"secondary"} className="bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-600">
                        <Plus /> Add New
                    </Button>
                </Link>
            </div>
            {/* separator */}
            <Separator className="my-8" />
            {/* content section  */}
            <div className="md:grid md:grid-cols-3 gap-3 py-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 md:h-32 rounded-md" />
                    ))
                ) : interviews.length > 0 ? (
                    interviews.map((interview) => renderInterviewPin(interview))
                ) : (
                    <div className="md:col-span-3 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                        <svg
                            className="w-16 h-16 mb-4 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <p className="text-center text-gray-500 mb-6">
                            No data found. Please create a mock interview to get started!
                        </p>
                        <Link to={"/interview/create"}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-600"
                            >
                                Create Interview
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!interviewToDelete} onOpenChange={(open) => !open && setInterviewToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the mock interview.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};