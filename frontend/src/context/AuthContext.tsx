import { createContext, useContext, useState } from 'react';
import type {ReactNode} from 'react';
interface User {
    email: string;
    name: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const name = localStorage.getItem('name');
        return token && email && name ? { token, email, name } : null;
    });

    const login = (userData: User) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('email', userData.email);
        localStorage.setItem('name', userData.name);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        setUser(null);
    };

    return (
        <AuthContext.Provider value ={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
    };

    export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error('useAuth must be used withing an AuthProvider');
        return context;
    };

