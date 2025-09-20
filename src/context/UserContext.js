'use client'

import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);

    return (
        <UserContext.Provider value={{ user, setUser, business, setBusiness }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);
