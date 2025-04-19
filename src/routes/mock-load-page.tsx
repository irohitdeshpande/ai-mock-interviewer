import { db } from '@/config/firebase.config';
import { Interview } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoaderPage } from './loader-page';
import { CustomBreadCrumb } from '@/components/custom-bread-crumb';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, WebcamIcon } from 'lucide-react';
import { InterviewPin } from '@/components/pin';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WebCam from "react-webcam";

export const MockLoadPage = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(false);
    const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);
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
            <div className="flex items-center justify-between w-full gap-2">
                <CustomBreadCrumb
                    breadCrumbPage={"Start Interview"}
                    breadCrumpItems={[{ label: "Interview", link: "/interview" }]}
                />
                <Link to={`/interview/simulate/${interviewId}/start`}>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm flex items-center gap-2"
                    >
                        Start <Sparkles />
                    </Button>
                </Link>
            </div>

            <InterviewPin interview={interview} onMockPage />

            <Alert className="bg-indigo-100/50 border-indigo-200 p-4 rounded-lg flex items-start gap-3 -mt-3">
                <Lightbulb className="h-5 w-5 text-indigo-600" />
                <div className="space-y-3 w-full">
                    <AlertTitle className="text-indigo-800 font-semibold text-lg">
                        Before We Begin
                    </AlertTitle>
                    <AlertDescription className="text-sm text-indigo-700 space-y-4">
                        <div>
                            <h4 className="font-medium mb-1 text-indigo-800">Webcam and Microphone Access:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Please enable your <strong>webcam and microphone access</strong> when prompted</li>
                                <li>Ensure you're in a <strong>well-lit, quiet environment</strong> for optimal experience</li>
                                <li>Test your <strong>audio and video</strong> before starting the full interview</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-1 text-indigo-800">Interview Format:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>This session consists of <strong>8</strong> comprehensive questions</li>
                                <li>Each question has a <strong>5-minute response</strong> time limit</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-1 text-indigo-800">Privacy Assurance:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Your video feed is <strong>never recorded or stored</strong></li>
                                <li>Audio analysis is performed in <strong>real-time without storage</strong></li>
                                <li>You <strong>may disable</strong> your webcam at any time during the interview</li>
                                <li>All analysis is done <strong>locally</strong> in your browser for maximum privacy</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-1 text-indigo-800">After Completion:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>You'll receive a <strong>detailed performance report</strong> with <strong>personalized feedback</strong></li>
                                <li>Analysis will include <strong>communication skills, technical accuracy, and clarity</strong></li>
                                <li><strong>Recommendations for improvement</strong> will be provided based on your responses</li>
                            </ul>
                        </div>

                        <div className="pt-1 border-t border-indigo-200">
                            <p className="font-medium text-indigo-800">Ready to begin? Click "Start" when you're prepared.</p>
                        </div>
                    </AlertDescription>
                </div>
            </Alert>

            <div className="flex items-center justify-center w-full h-full">
                <div className="w-full aspect-video flex flex-col items-center justify-center border p-4 bg-indigo-50 rounded-md">
                    {isWebCamEnabled ? (
                        <WebCam
                            audio
                            onUserMedia={() => setIsWebCamEnabled(true)}
                            onUserMediaError={() => setIsWebCamEnabled(false)}
                            className="w-full h-full object-cover rounded-md"
                        />
                    ) : (
                        <WebcamIcon className="w-16 h-16 text-muted-foreground" />
                    )}
                </div>
            </div>

            <div className="flex items-center justify-center">
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setIsWebCamEnabled(prev => !prev)}
                >
                    {isWebCamEnabled ? "Disable Webcam" : "Enable Webcam"}
                </Button>
            </div>
        </div>
    );
};
