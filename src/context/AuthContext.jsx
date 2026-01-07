import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined)
    const [loading, setLoading] = useState(true)

    // Sign up
    const signUpNewUser = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        if (error) {
            console.error(error)
            return { success: false, error }
        }
        return { success: true, data }
    };

    // Sign in
    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) {
                console.error(error)
                return { success: false, error }
            }
            return { success: true, data }
        } catch (error) {
            console.error(error)
            return { success: false, error }
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setLoading(false)
        });
    }, []);

    // Sign out
    const signOut = () => {
        const { error } = supabase.auth.signOut();
        if (error) {
            console.error(error)
            return { success: false, error }
        }
        return { success: true }
    };
    return (
        <AuthContext.Provider value={{ session, loading, signUpNewUser, signInUser, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
