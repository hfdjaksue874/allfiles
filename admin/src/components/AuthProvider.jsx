
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login, logout } from '../redux/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Check if token is expired (basic JWT check)
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            // Token is expired
            localStorage.removeItem('token');
            dispatch(logout());
          } else {
            // Token exists and is not expired
            dispatch(login());
          }
        } catch (error) {
            console.log(error)
          // If token parsing fails, assume it's valid for now
          // This prevents logout on refresh if the backend is down
          dispatch(login());
        }
      } else {
        dispatch(logout());
      }
    };

    validateToken();
  }, [dispatch]);

  return children;
};

export default AuthProvider;
