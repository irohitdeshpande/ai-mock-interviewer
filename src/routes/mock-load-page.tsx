import { db } from '@/config/firebase.config';
import { Interview } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoaderPage } from './loader-page';
import { CustomBreadCrumb } from '@/components/custom-bread-crumb';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export const MockLoadPage = () => {

    const { interviewId } = useParams<{ interviewId: string }>();
    const { interview, setInterview } = useState<Interview | null>(null);
    const { loading, setLoading } = useState(false);
    const { isWebCamEnabled, setIsWebCamEnabled } = useState(false);
    const navigate = useNavigate();
    if (!interviewId) {
        navigate('/interview', { replace: true });
    }
    useEffect(() => {
        const fetchInterview = async () => {
            if (interviewId) {
                try {
                    const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
                    if (interviewDoc.exists()) {
                        setInterview({
                            id: interviewDoc.id,
                            ...interviewDoc.data()
                        } as Interview
                        );
                    }
                } catch (error) {
                    console.error("Error fetching interview:", error);
                }
            }
        };
        fetchInterview();
    }, [interviewId, navigate, setInterview]);
    if (loading) {
        return <LoaderPage className="w-full h-screen" />
    }
    return (
        <div className="flex flex-col w-full gap-8 py-5">
            <div className="flex items-center justify-between w-full gap-2">
                <CustomBreadCrumb
                    breadCrumbPage={interview?.company || "Interview"}
                    breadCrumpItems={[{ label: "Interview", link: "/interview" }]} />
                <Link to={`/interview/simulate/${interviewId}/start`}>
                    <Button size={"sm"} className = "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm flex items-center gap-2">
                        Start <Sparkles />
                    </Button>
                </Link>
            </div>
        </div>

    );
};
