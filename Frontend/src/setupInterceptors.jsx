import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from './redux/slices/authSlice'; 

const SetupInterceptors = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    axios.interceptors.response.use(
        (response) => response, 
        (error) => {
            if (error.response?.status === 401) {
                dispatch(logout());
                navigate('/signin', { replace: true });
            }
            return Promise.reject(error);
        }
    );

    return null;
};

export default SetupInterceptors;