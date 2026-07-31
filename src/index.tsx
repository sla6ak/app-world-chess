import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "../node_modules/modern-normalize/modern-normalize.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { ToastContainer, Zoom } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@redux/store";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="auto"
                    transition={Zoom}
                />
                <App />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
