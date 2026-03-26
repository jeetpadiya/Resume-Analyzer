import {createContext, useState,useEffect,useContext} from 'react'

type User = {
    _id:string;
    name:string;
    email:string;
}

type AuthContextType = {
    user:User | null;
    token:string | null;
    login : (token:string,user:User) =>void;
    register: (token: string, user: User) => void; 
    loading?:boolean;
    logout: () =>void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}:{children:React.ReactNode})=>{
    const [token,setToken] = useState<string | null>(null);
    const [user,setUser] = useState<User | null>(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        try {

            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if(storedToken && storedUser){
                setToken(storedToken)
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Error loading auth data from localStorage:", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    },[]);

    const login = (token:string,user:User) =>{
        localStorage.setItem("token",token);
        localStorage.setItem('user',JSON.stringify(user))

        setToken(token)
        setUser(user)

    }

    const register = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setUser(user);
};

    const logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setToken(null);
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{user,token,login,logout,loading,register}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};