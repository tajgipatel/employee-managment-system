import "./App.css";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./Dashboard/pages/Dashboard";
import MainNav from "./Navigation/MainNav";
import EditEmployee from "./User/pages/EditEmployee";
import { useCallback, useEffect, useState } from "react";
import userContext from "./context/userContext";
import LeavePage from "./Dashboard/components/LeavePage";
import ApproveLeave from "./Dashboard/components/ApproveLeave";
import AllLeaves from "./Dashboard/pages/AllLeaves";
import axios from "axios";
import Profile from "./UserProfile/pages/Profile";
import { ConfigProvider } from "antd";
import NewUser from "./User/pages/NewUser";
import LoginUser from "./User/pages/LoginUser";
import NotFound from "./NotFound";

// 🔐 Only protect some routes — not login/signup
function PrivateRoute({ children }) {
  const auth = JSON.parse(localStorage.getItem("items"));
  return auth?.token ? children : <Navigate to="/login" replace />;
}

function App() {
  const getLocalItem = () => {
    return JSON.parse(localStorage.getItem("items"));
  };

  const isAuth = getLocalItem();
  const [session, setSession] = useState(isAuth || "");
  const [currentUser, setCurrentUser] = useState();

  const setLocalItem = (token, userId, superuser) => {
    localStorage.setItem(
      "items",
      JSON.stringify({
        token,
        userId,
        isSuperUser: superuser,
      })
    );
  };

  const login = useCallback((token, uid, superuser) => {
    setSession({ token, userId: uid, isSuperUser: superuser });
    setLocalItem(token, uid, superuser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("items");
    setSession({ token: "", userId: "", isSuperUser: false });
  }, []);

  const { token, userId, isSuperUser } = session;

  const getUserData = async () => {
    if (token) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${userId}`
        );
        setCurrentUser(response.data.user);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getUserData();
  }, [token]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelFontSize: 16,
          },
        },
      }}
    >
      <userContext.Provider
        value={{
          isLoggedIn: !!token,
          userId,
          token,
          isSuperUser,
          currentUser,
          getUserData,
          login,
          logout,
        }}
      >
        <Router>
          <MainNav />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginUser />} />
            <Route path="/signup" element={<NewUser />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/leave-page"
              element={
                <PrivateRoute>
                  <AllLeaves />
                </PrivateRoute>
              }
            />
            <Route
              path="/ask-for-leave/:uid"
              element={
                <PrivateRoute>
                  <LeavePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit/:uid"
              element={
                <PrivateRoute>
                  <EditEmployee />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:uid"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/approve-leave"
              element={
                <PrivateRoute>
                  <ApproveLeave />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </userContext.Provider>
    </ConfigProvider>
  );
}

export default App;
