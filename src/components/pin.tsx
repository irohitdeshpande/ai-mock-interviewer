import { Interview } from "@/types"
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardDescription,
    CardFooter,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Eye, Newspaper, Sparkles } from "lucide-react";


interface InterviewPinProps {
    interview?: Interview;
    onMockPage?: boolean;
}

export const InterviewPin = ({ interview, onMockPage = false }: InterviewPinProps) => {
    const navigate = useNavigate();
    const { loading, setLoading } = useState(false);
    const { userId } = useAuth();

    return (
        <Card className="p-4 rounded-md shadow-none hover:shadow-md shadow-gray-100 cursor-pointer transition-all space-y-4">
            <CardTitle className="text-lg">{interview?.position}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
                {interview?.company}
            </CardDescription>
            <div className="w-full flex items-center gap-1 flex-wrap">
                {interview?.techStack.split(",").map((word, index) => (
                    <Badge key={index} variant={"outline"} className="text-xs text-muted-foreground hover:bg-indigo-100 hover:text-indigo-600">{word}</Badge>
                ))}
            </div>

            <CardFooter className={cn("w-full flex items-center p-0", onMockPage ? "justify-end" : "justify-between")}>
                <p className="text-[12px] text-muted-foreground truncate whitespace-nowrap">
                    {interview?.createdAt ? `${new Date(interview.createdAt.toDate()).toLocaleDateString(
                        "en-UK",
                        { dateStyle: "long" }
                    )} - ${new Date(interview.createdAt.toDate()).toLocaleTimeString(
                        "en-UK",
                        { timeStyle: "short" }
                    )}` : "Date not available"}
                </p>
                {!onMockPage && (
                    <div className="flex items-center justify-center">
                        <TooltipButton
                            content="View"
                            buttonVariant={"ghost"}
                            onClick={() => {
                                navigate(`/interview/${interview?.id}`, { replace: true });
                            }}
                            disbaled={false}
                            buttonClassName="hover:text-indigo-600"
                            icon={<Eye />}
                            loading={false}
                        />

                        <TooltipButton
                            content="Feedback"
                            buttonVariant={"ghost"}
                            onClick={() => {
                                navigate(`/interview/feedback/${interview?.id}`, {
                                    replace: true,
                                });
                            }}
                            disbaled={false}
                            buttonClassName="hover:text-indigo-600"
                            icon={<Newspaper />}
                            loading={false}
                        />

                        <TooltipButton
                            content="Start"
                            buttonVariant={"ghost"}
                            onClick={() => {
                                navigate(`/interview/simulate/${interview?.id}`, {
                                    replace: true,
                                });
                            }}
                            disbaled={false}
                            buttonClassName="hover:text-indigo-600"
                            icon={<Sparkles />}
                            loading={false}
                        />
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
