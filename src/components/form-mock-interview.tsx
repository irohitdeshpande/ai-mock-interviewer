import { Interview } from "@/types"
import { CustomBreadCrumb } from "./custom-bread-crumb"

interface FormMockInterviewProps {
    initialData: Interview | null
}
export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
    return (
        <div className="my-4 flex-col w-full">
            <CustomBreadCrumb
                breadCrumbPage={breadCrumpPage}
                breadCrumpItems={[{ label: "Mock Interview", link: "/interview" }]}
            />
        </div>
    );
};
