import { Headings } from "@/components/headings"
import { Button } from "@/components/ui/button"
import { Separator } from "@radix-ui/react-separator";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom"

export const Dashboard = () => {
    return (
        <>
            <div className="flex w-full items-center justify-between">
                {/* heading */}
                <Headings title="Dashboard" description="Your dashboard for all your interviews" />
                <Link to={"/interview/create"}>
                    <Button size={"sm"}>
                        <Plus /> Add New
                    </Button>
                </Link>
            </div>
            {/* separator */}
            <Separator className="my-8" />
            {/* content section  */}
        </>
    );
}
