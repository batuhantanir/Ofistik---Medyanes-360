import '@/styles/globals.css';
import {Provider} from 'react-redux';
import {store} from '@/store/store';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify';
import {useRouter} from "next/navigation";
import Header from "@/containers/Home/_components/header";
import Footer from "@/containers/Home/_components/footer";
import {headers} from "next/headers";

export default function RootLayout({children}) {

    return (
        <html lang='en' className='scroll-smooth focus:scroll-auto'>
        <body className='overflow-y-auto scroll-smooth overflow-x-hidden flex flex-col font-sans bg-primary'>
        <Provider store={store}>
            <Header/>
            {children}
            <Footer/>

            {/* Toastify */}
            <ToastContainer
                position='bottom-right'
                autoClose={500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusL oss
                draggable
                pauseOnHover
                theme='colored'
            />
        </Provider>
        </body>
        </html>
    );
}
