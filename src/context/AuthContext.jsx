import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined)
    const [loading, setLoading] = useState(true)

    // Error Translation Helper
    const translateError = (error) => {
        const message = error.message;
        if (message.includes("User already registered")) return "Usuário já registrado.";
        if (message.includes("Invalid login credentials")) return "Credenciais inválidas.";
        if (message.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
        if (message.includes("Retry after")) return "Muitas tentativas. Tente novamente mais tarde.";
        if (message.includes("function public.delete_user") || message.includes("Could not find the function")) return "Erro de configuração: Função de exclusão não encontrada.";
        // Fallback
        return "Erro: " + message;
    }

    // Sign up
    const signUpNewUser = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        if (error) {
            console.error(error)
            return { success: false, error: { message: translateError(error) } }
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
                return { success: false, error: { message: translateError(error) } }
            }
            return { success: true, data }
        } catch (error) {
            console.error(error)
            return { success: false, error: { message: translateError(error) } }
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
            return { success: false, error: { message: translateError(error) } }
        }
        return { success: true }
    };

    // Update Password
    const updateUserPassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) {
            console.error(error)
            return { success: false, error: { message: translateError(error) } }
        }
        return { success: true, data }
    };

    // Delete User
    const deleteUserAccount = async () => {
        const { data, error } = await supabase.rpc('delete_user');
        if (error) {
            console.error(error)
            return { success: false, error: { message: translateError(error) } }
        }
        return { success: true, data }
    };

    return (
        <AuthContext.Provider value={{ session, loading, signUpNewUser, signInUser, signOut, updateUserPassword, deleteUserAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
