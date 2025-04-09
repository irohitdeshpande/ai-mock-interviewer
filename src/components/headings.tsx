import { cn } from "@/lib/utils"

interface HeadingsProps {
    title: string;
    description: string;
    isSubHeading?: boolean;
}
export const Headings = ({
    title,
    description,
    isSubHeading = false,
}: HeadingsProps) => {
    return (
        <div>
            <h2 className={
                cn(
                    "text-xl md:text-3xl font-semibold text-gray-800 font-sans mb-2",
                    isSubHeading && "text-xl font-semibold text-gray-700"
                )
            }>
                {title}
            </h2>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
};
