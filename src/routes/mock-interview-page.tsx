import { db } from '@/config/firebase.config';
import { Interview } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { LoaderPage } from './loader-page';
import { CustomBreadCrumb } from '@/components/custom-bread-crumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import { QuestionSection } from '@/components/question-section';
import Agent from '@/components/agent';
import { InterviewContext } from '@/services/vapi.service';
import { InterviewInstructions } from '@/components/interview-instructions';

export const MockInterviewPage = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(false);
    const [useVapiMode, setUseVapiMode] = useState(true); // Toggle between VAPI and old system
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

    const handleInterviewComplete = (transcript: string, messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>) => {
        console.log('Interview completed:', { transcript, messages });
        // Navigate to feedback page or save results
        navigate(`/interview/feedback/${interviewId}`);
    };

    const handleInterviewEnd = () => {
        console.log('Interview ended');
        // You can add additional cleanup here
    };

    if (loading) {
        return <LoaderPage className="w-full h-screen" />;
    }

    if (!interview) {
        return null; // Prevent rendering while interview is null
    }

    // Create interview context for VAPI
    const interviewContext: InterviewContext = {
        interviewId: interview.id,
        position: interview.position,
        company: interview.company || 'Unknown Company',
        experience: interview.experience || 0,
        questions: interview.questions || [],
        currentQuestionIndex: 0
    };

    return (
        <div className="flex flex-col w-full gap-8 py-5">
            <CustomBreadCrumb
                breadCrumbPage={"Start Interview"}
                breadCrumpItems={[{ label: "Interview", link: "/" }, { label: interview?.company || "Mock", link: `/simulate/${interviewId}` }]}
            />

            {/* Mode Toggle */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Mic className="h-5 w-5" />
                            Interview Mode
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${!useVapiMode ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                                Traditional
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUseVapiMode(!useVapiMode)}
                                className="p-1"
                            >
                                {useVapiMode ? (
                                    <ToggleRight className="h-6 w-6 text-indigo-600" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                                )}
                            </Button>
                            <span className={`text-sm ${useVapiMode ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                                AI Voice Interview
                            </span>
                            <Badge variant={useVapiMode ? "default" : "secondary"}>
                                {useVapiMode ? "Real-time AI" : "Traditional"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {useVapiMode ? (
                            <>
                                <MessageSquare className="inline h-4 w-4 mr-1" />
                                Experience a real-time conversation with an AI interviewer. Similar to a Google Meet call with voice interaction.
                            </>
                        ) : (
                            <>
                                Record and review your answers to interview questions with AI feedback.
                            </>
                        )}
                    </p>
                </CardContent>
            </Card>

            {/* Common Instructions for both modes */}
            <InterviewInstructions isVapiMode={useVapiMode} />

            {useVapiMode ? (
                // VAPI Real-time Interview Mode
                <Agent
                    userName="Interview Candidate"
                    userId="user-123"
                    type="interview"
                    interviewContext={interviewContext}
                    onInterviewComplete={handleInterviewComplete}
                    onInterviewEnd={handleInterviewEnd}
                />
            ) : (
                // Traditional Interview Mode
                <>
                    {interview?.questions && interview?.questions.length > 0 && (
                        <div className="flex flex-col w-full items-start gap-4">
                            <QuestionSection questions={interview?.questions} />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}