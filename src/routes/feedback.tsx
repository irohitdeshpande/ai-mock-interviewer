import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import * as accordion from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Star, CheckCircle } from "lucide-react";

export const Feedback = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
    const [activeFeed, setActiveFeed] = useState("");
    const { userId } = useAuth();
    const navigate = useNavigate();

    if (!interviewId) {
        navigate("/interview", { replace: true });
    }
    useEffect(() => {
        if (interviewId) {
            const fetchInterview = async () => {
                if (interviewId) {
                    try {
                        const interviewDoc = await getDoc(
                            doc(db, "interviews", interviewId)
                        );
                        if (interviewDoc.exists()) {
                            setInterview({
                                id: interviewDoc.id,
                                ...interviewDoc.data(),
                            } as Interview);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            };

            const fetchFeedbacks = async () => {
                setIsLoading(true);
                try {
                    const querSanpRef = query(
                        collection(db, "userAnswers"),
                        where("userId", "==", userId),
                        where("mockIdRef", "==", interviewId)
                    );

                    const querySnap = await getDocs(querSanpRef);

                    const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
                        return { id: doc.id, ...doc.data() } as UserAnswer;
                    });

                    setFeedbacks(interviewData);
                } catch (error) {
                    console.log(error);
                    toast("Error", {
                        description: "Something went wrong. Please try again later..",
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInterview();
            fetchFeedbacks();
        }
    }, [interviewId, navigate, userId]);

    //   calculate the ratings out of 10

    const overAllRating = useMemo(() => {
        if (feedbacks.length === 0) return "0.0";

        const totalRatings = feedbacks.reduce(
            (acc, feedback) => acc + feedback.rating,
            0
        );

        return (totalRatings / feedbacks.length).toFixed(1);
    }, [feedbacks]);

    if (isLoading) {
        return <LoaderPage className="w-full h-[70vh]" />;
    }


    return (
        <div className="flex flex-col w-full gap-8 py-5">
            <div className="flex items-center justify-between w-full gap-2">
                <CustomBreadCrumb
                    breadCrumbPage={"Feedback"}
                    breadCrumpItems={[
                        { label: "Mock Interviews", link: "/interview" },
                        {
                            label: `${interview?.position}`,
                            link: `/interview/simulate/${interview?.id}`,
                        },
                    ]}
                />
            </div>

            <Headings
                title="Congratulations!"
                description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
            />

            <div className="flex items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                <div className="text-base text-slate-700">
                    Your overall interview rating: {" "}
                    <span className="text-indigo-600 font-semibold text-xl">
                        {overAllRating} / 10
                    </span>
                </div>
                <div className="ml-auto flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            className={`h-5 w-5 ${parseFloat(overAllRating) >= star * 2 ? "text-indigo-500 fill-indigo-500" : "text-gray-300"}`}
                        />
                    ))}
                </div>
            </div>

            {interview && <InterviewPin interview={interview} onMockPage />}

            <div className="flex items-center justify-between">
                <Headings title="Interview Feedback" isSubHeading description={""} />
                <div className="text-sm text-slate-500">
                    {feedbacks.length} question{feedbacks.length !== 1 ? 's' : ''} answered
                </div>
            </div>

            {feedbacks && (
                <accordion.Accordion type="single" collapsible className="space-y-6">
                    {feedbacks.map((feed) => (
                        <accordion.AccordionItem
                            key={feed.id}
                            value={feed.id}
                            className="border border-slate-200 rounded-lg shadow-sm overflow-hidden"
                        >
                            <accordion.AccordionTrigger
                                onClick={() => setActiveFeed(feed.id)}
                                className={cn(
                                    "px-5 py-4 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                                    activeFeed === feed.id
                                        ? "bg-slate-100 text-slate-800"
                                        : "bg-white text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium mr-3">
                                        Q
                                    </div>
                                    <span className="font-medium">{feed.question}</span>
                                </div>
                            </accordion.AccordionTrigger>

                            <accordion.AccordionContent className="px-0 pb-0 pt-0 bg-white shadow-inner divide-y divide-slate-100 rounded-lg">
                               

                                {/* Expected Answer section
                                <div className="bg-indigo-50 p-5 flex">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-medium mr-3">
                                        A
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-indigo-700">Expected Answer</div>
                                        <div className="text-indigo-900">{feed.correct_ans}</div>
                                    </div>
                                </div> */}

                                {/* Your Answer section */}
                                <div className="bg-indigo-100 p-5 flex rounded-lg">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-800 font-medium mr-3 ">
                                        A
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-indigo-800">Your Answer</div>
                                        <div className="text-indigo-900">{feed.user_ans}</div>
                                    </div>
                                </div>

                                {/* Feedback section */}
                                <div className="bg-green-50 p-5 flex rounded-lg">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-medium mr-3">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-green-700">Feedback</div>
                                        <div className="text-green-800">
                                            {feed.feedback}
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {feed.rating >= 8 && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Strong Response
                                                </span>
                                            )}
                                            {feed.rating >= 5 && feed.rating < 8 && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                                    Good Response
                                                </span>
                                            )}
                                            {feed.rating < 5 && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                    Needs Improvement
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </accordion.AccordionContent>
                        </accordion.AccordionItem>
                    ))}
                </accordion.Accordion>
            )}
        </div>
    );
};