import { db } from '@/config/firebase.config';
import { Interview } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoaderPage } from './loader-page';
import { CustomBreadCrumb } from '@/components/custom-bread-crumb';
import { Button } from '@/components/ui/button';
import { Sparkles, WebcamIcon } from 'lucide-react';
import { InterviewPin } from '@/components/pin';
import { InterviewInstructions } from '@/components/interview-instructions';
// WebCam removed - using native WebRTC

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
                    breadCrumbPage={"Guidelines"}
                    breadCrumpItems={[{ label: "Interview", link: "/interview" }]}
                />
                <Link to={`/interview/simulate/${interviewId}/interview`}>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm flex items-center gap-2"
                    >
                        Start <Sparkles />
                    </Button>
                </Link>
            </div>

            <InterviewPin interview={interview} onMockPage />

            {/* Common Instructions Component */}
            <InterviewInstructions isVapiMode={true} className="-mt-3" />

            <div className="w-full max-w-xl mx-auto">
                <div className="w-full aspect-video flex flex-col items-center justify-center border p-4 bg-indigo-50 rounded-md">
                    {isWebCamEnabled ? (
                        <video
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover rounded-md"
                            ref={(video) => {
                                if (video && !video.srcObject) {
                                    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                                        .then(stream => {
                                            video.srcObject = stream;
                                            setIsWebCamEnabled(true);
                                        })
                                        .catch(() => setIsWebCamEnabled(false));
                                }
                            }}
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
