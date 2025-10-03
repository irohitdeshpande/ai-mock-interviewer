import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle2, Mic, MessageSquare, Clock, Shield, BarChart3 } from 'lucide-react';

interface InterviewInstructionsProps {
  isVapiMode?: boolean;
  className?: string;
}

export const InterviewInstructions: React.FC<InterviewInstructionsProps> = ({ 
  isVapiMode = false, 
  className = "" 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <Alert className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg">
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-indigo-700" />
            <AlertTitle className="text-indigo-900 font-semibold text-lg">
              {isVapiMode ? "AI Voice Interview Instructions" : "Interview Instructions"}
            </AlertTitle>
            <Badge variant={isVapiMode ? "default" : "secondary"} className="ml-auto">
              {isVapiMode ? "Real-time AI" : "Traditional"}
            </Badge>
          </div>

          <AlertDescription className="text-indigo-800 space-y-4">
            {isVapiMode ? (
              <>
                <div className="bg-white bg-opacity-70 p-4 rounded-md border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-indigo-700" />
                    <span className="font-medium text-indigo-900">Voice Interview Experience</span>
                  </div>
                  <p className="text-sm text-indigo-700 mb-2">
                    You'll be speaking with an <strong>AI interviewer</strong> in real-time, similar to a Google Meet call.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                    <li>Speak naturally and conversationally</li>
                    <li>The AI will ask follow-up questions based on your responses</li>
                    <li>Take your time - there's no rush between questions</li>
                    <li>You can ask for clarification if needed</li>
                  </ul>
                </div>

                <div className="bg-white bg-opacity-70 p-4 rounded-md border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-indigo-700" />
                    <span className="font-medium text-indigo-900">Audio & Video Setup</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                    <li>Please enable your <strong>microphone and camera</strong> when prompted</li>
                    <li>Ensure you're in a <strong>quiet, well-lit environment</strong></li>
                    <li>Test your audio before starting the interview</li>
                    <li>You can toggle your camera on/off during the interview</li>
                  </ul>
                </div>
              </>
            ) : (
              <div>
                <p className="mb-4">
                  Press the <strong>Record Answer</strong> button to begin answering your interview question. Take your time and speak clearly.
                </p>
              </div>
            )}

            <div className="bg-white bg-opacity-70 p-4 rounded-md border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-indigo-700" />
                <span className="font-medium text-indigo-900">Interview Format</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                <li>This session consists of <strong>8 comprehensive questions</strong></li>
                <li>Mix of technical, behavioral, and company-specific questions</li>
                <li>Each question has a <strong>recommended response time</strong> of 2-3 minutes</li>
                <li>Total estimated time: <strong>20-25 minutes</strong></li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-70 p-4 rounded-md border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-indigo-700" />
                <span className="font-medium text-indigo-900">Privacy & Security</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                <li><strong>Your video is never recorded or stored</strong></li>
                <li>Audio analysis is performed in <strong>real-time without storage</strong></li>
                <li>You can disable your camera at any time during the interview</li>
                <li>All data processing is secure and privacy-compliant</li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-70 p-4 rounded-md border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-indigo-700" />
                <span className="font-medium text-indigo-900">After Completion</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                <li>You'll receive a <strong>detailed performance report</strong></li>
                <li>Personalized feedback on each answer with improvement suggestions</li>
                <li>Overall rating and areas of strength/improvement</li>
                <li>Recommendations for your interview preparation</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-indigo-700 mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">
                Ready to showcase your skills? Click "Start Interview" when you're prepared!
              </p>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};