import { db } from "@/config/firebase.config";
import { LoaderPage } from "@/routes/loader-page";
import { useAuth, useUser } from "@clerk/clerk-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/types";

const AuthHandler = () => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const pathName = useLocation().pathname;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const storeUserData = async () => {
            if (isSignedIn && user) {
                setLoading(true);
                try {
                    const userSnap = await getDoc(doc(db, "users", user.id));
                    if (!userSnap.exists()) {
                        const userData: User = {
                            id: user.id,
                            name: user.fullName || user.firstName || user.lastName || user.username || 'User',
                            email: user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : '',
                            imageUrl: user.imageUrl,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        };
                        await setDoc(doc(db, "users", user.id), userData);
                    }
                }
                catch (error) {
                    console.log(error);
                }
                finally {
                    setLoading(false);
                }
            }
        }
        storeUserData();
    }, [isSignedIn, user, pathName, navigate])

    if (loading) {
        return <LoaderPage />;
    }

    return null;
};
export default AuthHandler;