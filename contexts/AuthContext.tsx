import {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {Session} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    carregando: boolean;
    entrar: (email: string, senha: string) => Promise<{erro: string | null}>;
    cadastrar: (email: string, senha: string) => Promise<{erro: string | null}>;
    sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setCarregando(false);
        });
        const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);
    
    async function entrar(email: string, senha: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        return {erro: error ? error.message: null};
    }
    async function cadastrar(email: string, senha: string) {
        const { error } = await supabase.auth.signUp({email, password: senha});
        return {erro: error ? error.message: null};
    }
    async function sair(){
        await supabase.auth.signOut();
    }
    return (
        <AuthContext.Provider value={{ session, carregando, entrar, cadastrar, sair }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
}