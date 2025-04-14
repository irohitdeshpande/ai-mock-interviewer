import { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

export interface Interview {
    whyJoinUs: string | null | undefined;
    company: string | undefined;
    interviewDate: Date | null | undefined;
    interviewTime: string | null | undefined;
    id: string;
    position: string;
    description: string;
    experience: number;
    userId: string;
    techStack: string;
    questions: { question: string; answer: string }[];
    createdAt: Timestamp;
    updateAt: Timestamp;
}
