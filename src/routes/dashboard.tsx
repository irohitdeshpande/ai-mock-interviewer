import { Headings } from "@/components/headings"
import { InterviewPin } from "@/components/pin";
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { Separator } from "@radix-ui/react-separator";
import { query, collection, where, onSnapshot } from "firebase/firestore";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { toast } from "sonner";

export const Dashboard = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
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

    return (
        <>
            <div className="flex w-full items-center justify-between">
                {/* heading */}
                <Headings title="Dashboard" description="Your dashboard for all your interviews" />
                <Link to={"/interview/create"}>
                    <Button size={"sm"}>
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
                    interviews.map((interview) => (
                        <InterviewPin key = {interview.id} interview = {interview}/>
                    ))
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
                                className="bg-black text-white hover:bg-gray-800 border-black"
                            >
                                Create Interview
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

