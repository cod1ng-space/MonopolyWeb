import {
    createBrowserRouter,
    RouterProvider,
    Route
} from "react-router-dom";
import GamePage from "./pages/GamePage/GamePage";
import StartPage from "./pages/StartPage/StartPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import WaitPage from "./pages/WaitPage/WaitPage";
import FindGamePage from "./pages/FindGamePage/FindGamePage";

const router = createBrowserRouter([
    {
        path: "/game/:id",
        element: <GamePage />,
    },
    {
        path: "/",
        element: <StartPage />,
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/waiting-room/:id",
        element: <WaitPage />
    },
    {
        path: "/find-game",
        element: <FindGamePage />
    }
]);

export default <RouterProvider router={router} />