import Modal from "./modal";
import { Button } from "./ui/button";

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const SaveModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
}: SaveModalProps) => {
    return (
        <Modal
            title="Confirm Your Action"
            description="Are you sure you want to proceed? This action is irreversible, and you will not be able to edit or re-answer this question in the future."
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button disabled={loading} variant={"outline"} onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={onConfirm}
                >
                    Confirm and Continue
                </Button>
            </div>
        </Modal>
    );
};