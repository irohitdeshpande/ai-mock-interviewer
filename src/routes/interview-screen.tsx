import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { Interview } from '@/types';
import { LoaderPage } from './loader-page';
import Agent from '@/components/agent';
import { InterviewContext } from '@/services/vapi.service';

export const InterviewScreen = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!interviewId) {
            navigate('/interview', { replace: true });
            return;
        }

        const fetchInterview = async () => {
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
                navigate('/interview', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();
    }, [interviewId, navigate]);

    const handleInterviewComplete = (transcript: string, messages: Array<{type: 'user' | 'assistant'; content: string; timestamp: Date}>) => {
        console.log('Interview completed:', { transcript, messages });
        navigate(`/interview/feedback/${interviewId}`);
    };

    const handleInterviewEnd = () => {
        console.log('Interview ended');
        navigate(`/interview/simulate/${interviewId}`);
    };

    if (loading) {
        return <LoaderPage className="w-full h-screen" />;
    }

    if (!interview) {
        return null;
    }

    // Create comprehensive interview context for VAPI with Firebase data
    const interviewContext: InterviewContext = {
        interviewId: interview.id,
        position: interview.position,
        company: interview.company || 'the company',
        experience: interview.experience || 0,
        questions: interview.questions || [],
        currentQuestionIndex: 0,
        // Additional context for the AI interviewer
        techStack: interview.techStack,
        description: interview.description,
        whyJoinUs: interview.whyJoinUs,
        interviewDate: interview.interviewDate,
        interviewTime: interview.interviewTime
    };

    return (
        <div className="w-full h-screen">
            <Agent
                userName="Interview Candidate"
                userId={interview.userId || 'unknown-user'}
                type="interview"
                interviewContext={interviewContext}
                onInterviewComplete={handleInterviewComplete}
                onInterviewEnd={handleInterviewEnd}
            />
        </div>
    );
};