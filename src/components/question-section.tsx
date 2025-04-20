interface QuestionSectionProps {
    questions: { question: string; answer: string }[];
}

export const QuestionSection = ({ questions }: QuestionSectionProps) => {
    return (
        <div>QuestionSection</div>
    )
}
