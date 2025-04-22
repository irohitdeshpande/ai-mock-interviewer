import { useAuth } from '@clerk/clerk-react';
import { CircleStop, Loader, Mic, RefreshCw, Save, Video, VideoOff, WebcamIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSpeechToText, { ResultType } from 'react-hook-speech-to-text';
import { useParams } from 'react-router-dom';
import WebCam from 'react-webcam';
import { TooltipButton } from './tooltip-button';
import { ChatSession } from '@google/generative-ai';
interface RecordAnswerProps {
    question: { question: string; answer: string };
    isWebCam: boolean;
    setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
    ratings: number;
    feedback: string;
}


export const RecordAnswer = ({ question, isWebCam, setIsWebCam }: RecordAnswerProps) => {
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    const [userAnswer, setUserAnswer] = useState("");
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiResult, setAIResult] = useState<AIResponse | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { userId } = useAuth();
    const { interviewId } = useParams();

    const recordAnswer = async () => {
        if (isRecording) {
            stopSpeechToText();
            if (userAnswer?.length < 50) {
                alert("Please provide a more detailed answer.");
                return;
            }
            // AI Result Generation
            const aiResult = await generateResult(
                question.question,
                question.answer,
                userAnswer,
            );

        }
        else {
            startSpeechToText();
        }
    }

    const cleanedResponse = (responseText: string) => {
        try {
            let cleanText = responseText.trim();

            // If that fails, try removing code blocks and parsing
            cleanText = cleanText.replace(/```json|```|`/g, "").trim();

            return JSON.parse(cleanText);
        } catch (error) {
            console.error("Error parsing response:", error, responseText);
            throw new Error("Failed to parse AI response. Please try again.");
        }
    };

    const generateResult = async (
        qst: string,
        qstAns: string,
        userAns: string): Promise<AIResponse> => {
        setIsAIGenerating(true);
        const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;
        try {
            const aiResult = await ChatSession.sendMessage(prompt);
            const parsedResult: AIResponse = cleanedResponse(
                aiResult.response.text()
            );
            return parsedResult;
        }
        catch (error) {
            console.error("Error generating AI result:", error);
            return { ratings: 0, feedback: "Error generating AI result." };
        }
        finally {
            setIsAIGenerating(false);
        }

        const recordNewAnswer = () => {
            setUserAnswer("");
            stopSpeechToText();
            startSpeechToText();
        }

        useEffect(() => {
            const combineTranscripts = results.filter((result): result is ResultType => typeof result !== "string").map((result) => result.transcript).join(" ");
            setUserAnswer(combineTranscripts);
        }, [results])

        return (
            <div className="w-full flex flex-col items-center gap-8 mt-4">
                {/* save modal */}
                <div className="w-full aspect-video flex flex-col items-center justify-center border p-4 bg-indigo-50 rounded-md">
                    {isWebCam ? (
                        <WebCam
                            audio
                            onUserMedia={() => setIsWebCam(true)}
                            onUserMediaError={() => setIsWebCam(false)}
                            className="w-full h-full object-cover rounded-md"
                        />
                    ) : (
                        <WebcamIcon className="w-16 h-16 text-muted-foreground" />
                    )}
                </div>
                <div className="flex items-center justify-center gap-4 w-full">
                    <TooltipButton
                        content={isWebCam ? "Turn Off" : "Turn On"}
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
                        content="Record Again"
                        icon={<RefreshCw className="min-w-5 min-h-5" />}
                        onClick={recordNewAnswer}
                    />

                    <TooltipButton
                        content="Save Result"
                        icon={
                            isAIGenerating ? (
                                <Loader className="min-w-5 min-h-5 animate-spin" />
                            ) : (
                                <Save className="min-w-5 min-h-5" />
                            )
                        }
                        onClick={() => setOpen(!open)}
                        disbaled={!aiResult}
                    />
                </div>
                <div className="w-full mt-4 p-4 border rounded-md bg-indigo-100">
                    <h2 className="text-lg font-semibold">Your Answer</h2>
                    <p className="text-sm mt-2 text-indigo-600 whitespace-normal">
                        {userAnswer || "No answer recorded yet. Start speaking to record your answer."}
                    </p>
                    {interimResult && (
                        <p className="text-sm text-indigo-50 mt-2">
                            <strong>Speech Transcription</strong>
                            {interimResult}
                        </p>
                    )}
                </div>
            </div>
        );
    };
