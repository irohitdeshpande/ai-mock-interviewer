import { db } from '@/config/firebase.config';
import { Interview } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { LoaderPage } from './loader-page';
import { CustomBreadCrumb } from '@/components/custom-bread-crumb';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Video, CheckCircle2 } from 'lucide-react';
import { QuestionSection } from '@/components/question-section';

export const MockInterviewPage = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!interviewId) {
            navigate('/interview', { replace: true });
        }
    }, [interviewId, navigate]);

    useEffect(() => {
        const fetchInterview = async () => {
            if (interviewId) {
                setLoading(true);
                try {
                    const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
                    if (interviewDoc.exists()) {
                        setInterview({
                            id: interviewDoc.id,
                            ...interviewDoc.data()
                        } as Interview);
                    } else {
                        navigate('/interview', { replace: true });
                    }
                } catch (error) {
                    console.error("Error fetching interview:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchInterview();
    }, [interviewId, navigate]);

    if (loading) {
        return <LoaderPage className="w-full h-screen" />;
    }

    if (!interview) {
        return null; // Prevent rendering while interview is null
    }
    return (
        <div className="flex flex-col w-full gap-8 py-5">
            <CustomBreadCrumb
                breadCrumbPage={"Start Interview"}
                breadCrumpItems={[{ label: "Interview", link: "/simulate" }, { label: interview?.company || "Mock", link: `/simulate/${interviewId}` }]}
            />

            <div className="w-full">
                <Alert className="bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-start gap-4">
                    <div className="flex flex-col w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-blue-700" />
                            <AlertTitle className="text-blue-900 font-semibold text-lg">
                                Interview Instructions
                            </AlertTitle>
                        </div>

                        <AlertDescription className="text-blue-800 mb-4">
                            Press the <strong>Record Answer</strong> button to begin answering your interview question. Take your time and speak clearly.
                        </AlertDescription>

                        <div className="bg-white bg-opacity-70 p-4 rounded-md border border-blue-100 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Video className="h-4 w-4 text-blue-700" />
                                <span className="font-medium text-blue-900">Privacy Guarantee</span>
                            </div>
                            <p className="text-sm text-blue-700">
                                <span className="font-bold">Your video is never recorded.</span> You can disable the webcam at any time using the camera controls.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-blue-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <p className="text-sm">
                                After completing the interview, you'll receive feedback comparing your responses with ideal answers.
                            </p>
                        </div>
                    </div>
                </Alert>
            </div>

            {interview?.questions && interview?.questions.length > 0 && (
                <div className = "flex flex-col w-full items-start gap-4">
                    <QuestionSection questions={interview?.questions} />
                </div>
            )}
        </div>
    )
}
