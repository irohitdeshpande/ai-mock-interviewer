import { useAuth } from '@clerk/clerk-react';
import { CircleStop, Loader, Mic, RefreshCw, Save, Video, VideoOff, WebcamIcon } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import useSpeechToText, { ResultType } from 'react-hook-speech-to-text';
import { useParams } from 'react-router-dom';
import WebCam from 'react-webcam';
import { TooltipButton } from './tooltip-button';
import { SaveModal } from './save-modal';
import { db } from '@/config/firebase.config';
import { query, collection, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { chatSession } from '@/scripts';

interface RecordAnswerProps {
    question: { question: string; answer: string };
    isWebCam: boolean;
    setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
    ratings: number;
    feedback: string;
}

// Helper function to clean response text
const cleanedResponse = (responseText: string) => {
    try {
        let cleanText = responseText.trim();
        // First attempt direct parsing
        try {
            return JSON.parse(cleanText);
        } catch {
            // If that fails, try removing code blocks and parsing
            cleanText = cleanText.replace(/```json|```|`/g, "").trim();
            return JSON.parse(cleanText);
        }
    } catch (error) {
        console.error("Error parsing response:", error, responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
};

// Function to generate AI result
const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
): Promise<AIResponse> => {
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;
    try {
        // Using the chatSession from @/scripts
        const result = await chatSession.sendMessage(prompt);
        const text = result.response.text();
        
        // Parse the response
        const parsedResult: AIResponse = cleanedResponse(text);
        return parsedResult;
    }
    catch (error) {
        console.error("Error generating AI result:", error);
        return { ratings: 0, feedback: "Error generating AI result." };
    }
};

export const RecordAnswer = ({ question, isWebCam, setIsWebCam }: RecordAnswerProps) => {
    const [userAnswer, setUserAnswer] = useState("");
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiResult, setAIResult] = useState<AIResponse | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { userId } = useAuth();
    const { interviewId } = useParams();
    
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
        speechRecognitionProperties: {
            lang: 'en-US',
            interimResults: true,
        },
        crossBrowser: true, // Enable cross-browser support
    });
    
    useEffect(() => {
        if (error) {
            console.error("Speech recognition error:", error);
            toast.error("Speech recognition error. Please check your microphone permissions.");
        }
    }, [error]);
    
    useEffect(() => {
        const combineTranscripts = results
            .filter((result): result is ResultType => typeof result !== "string")
            .map((result) => result.transcript)
            .join(" ");
        
        if (combineTranscripts) {
            setUserAnswer(combineTranscripts);
        }
    }, [results]);
    
    const recordAnswer = useCallback(async () => {
        if (isRecording) {
            stopSpeechToText();
            if (userAnswer?.length < 50) {
                toast.warning("Please provide a more detailed answer (at least 50 characters).");
                return;
            }
            
            // AI Result Generation
            setIsAIGenerating(true);
            try {
                const result = await generateResult(
                    question.question,
                    question.answer,
                    userAnswer,
                );
                setAIResult(result);
                toast.success("Answer processed successfully!");
            } catch (error) {
                console.error("Error in recording answer:", error);
                toast.error("Failed to generate AI feedback");
            } finally {
                setIsAIGenerating(false);
            }
        }
        else {
            try {
                startSpeechToText();
                toast.info("Recording started. Start speaking...");
            } catch (err) {
                console.error("Failed to start recording:", err);
                toast.error("Failed to start recording. Please check your microphone permissions.");
            }
        }
    }, [isRecording, question, userAnswer, stopSpeechToText, startSpeechToText]);
    
    const recordNewAnswer = useCallback(() => {
        setUserAnswer("");
        if (isRecording) {
            stopSpeechToText();
        }
        setTimeout(() => {
            startSpeechToText();
            toast.info("New recording started. Start speaking...");
        }, 300);
    }, [isRecording, stopSpeechToText, startSpeechToText]);
    
    const saveAnswer = useCallback(async () => {
        setLoading(true);
        if (!aiResult) {
            toast.error("No feedback generated yet. Record an answer first.");
            setLoading(false);
            return;
        }
        
        const currentQuestion = question.question;
        try {
            // query the firebase to check if user answer already exists for this question
            const userAnswerQuery = query(
                collection(db, "userAnswers"),
                where("userId", "==", userId),
                where("question", "==", currentQuestion)
            );
            const querySnap = await getDocs(userAnswerQuery);
            
            // if the user already answered the question don't save it again
            if (!querySnap.empty) {
                toast.info("Already Answered", {
                    description: "You have already answered this question",
                });
            } else {
                // save the user answer
                await addDoc(collection(db, "userAnswers"), {
                    mockIdRef: interviewId,
                    question: question.question,
                    correct_ans: question.answer,
                    user_ans: userAnswer,
                    feedback: aiResult.feedback,
                    rating: aiResult.ratings,
                    userId,
                    createdAt: serverTimestamp(),
                });
                toast.success("Saved", { description: "Your answer has been saved." });
                setUserAnswer("");
                if (isRecording) {
                    stopSpeechToText();
                }
            }
        } catch (error) {
            console.error("Error saving answer:", error);
            toast.error("An error occurred while saving your answer.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }, [aiResult, question, userId, interviewId, userAnswer, isRecording, stopSpeechToText]);
    
    return (
        <div className="w-full flex flex-col items-center gap-8 mt-4">
            {/* save modal */}
            <SaveModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={saveAnswer}
                loading={loading}
            />
            
            <div className="w-full aspect-video flex flex-col items-center justify-center border p-4 bg-indigo-50 rounded-md">
                {isWebCam ? (
                    <WebCam
                        audio
                        onUserMedia={() => setIsWebCam(true)}
                        onUserMediaError={(err) => {
                            console.error("Webcam error:", err);
                            setIsWebCam(false);
                            toast.error("Failed to access webcam. Please check your permissions.");
                        }}
                        className="w-full h-full object-cover rounded-md"
                    />
                ) : (
                    <WebcamIcon className="w-16 h-16 text-muted-foreground" />
                )}
            </div>
            
            <div className="flex items-center justify-center gap-4 w-full">
                <TooltipButton 
                    buttonVariant="secondary"
                    content={isWebCam ? "Turn Off Camera" : "Turn On Camera"}
                    icon={
                        isWebCam ? (
                            <VideoOff className="min-w-5 min-h-5" />
                        ) : (
                            <Video className="min-w-5 min-h-5" />
                        )
                    }
                    onClick={() => setIsWebCam(!isWebCam)}
                />
                
                <TooltipButton 
                    buttonVariant="secondary"
                    content={isRecording ? "Stop Recording" : "Start Recording"}
                    icon={
                        isRecording ? (
                            <CircleStop className="min-w-5 min-h-5" />
                        ) : (
                            <Mic className="min-w-5 min-h-5" />
                        )
                    }
                    onClick={recordAnswer}
                />
                
                <TooltipButton 
                    buttonVariant="secondary"
                    content="Record Again"
                    icon={<RefreshCw className="min-w-5 min-h-5" />}
                    onClick={recordNewAnswer}
                    disbaled={isAIGenerating}
                />
                
                <TooltipButton 
                    buttonVariant="secondary"
                    content="Save Result"
                    icon={
                        isAIGenerating ? (
                            <Loader className="min-w-5 min-h-5 animate-spin" />
                        ) : (
                            <Save className="min-w-5 min-h-5" />
                        )
                    }
                    onClick={() => setOpen(true)}
                    disbaled={!aiResult || loading}
                />
            </div>
            
            <div className="w-full mt-4 p-4 border rounded-md bg-indigo-100">
                <h2 className="text-lg font-semibold text-indigo-600">Your Answer</h2>
                <p className="text-sm mt-2 text-indigo-600 whitespace-normal">
                    {userAnswer || "No answer recorded yet. Start speaking to record your answer."}
                </p>
                {isRecording && interimResult && (
                    <p className="text-sm text-indigo-600 mt-2">
                        <strong>Current Transcription: </strong>
                        {interimResult}
                    </p>
                )}
                {error && (
                    <p className="text-sm text-red-500 mt-2">
                        <strong>Error: </strong>
                        {error}
                    </p>
                )}
                {aiResult && (
                    <div className="mt-4 p-3 bg-white rounded-md">
                        <h3 className="font-medium text-indigo-700">Feedback:</h3>
                        <p className="text-sm">{aiResult.feedback}</p>
                        <p className="text-sm mt-1">
                            <strong>Rating: </strong>
                            {aiResult.ratings}/10
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};