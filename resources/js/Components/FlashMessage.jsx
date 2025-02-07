// En FlashMessage.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FlashMessage = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop={true}
            closeOnClick
            pauseOnHover
        />
    );
};

export default FlashMessage;