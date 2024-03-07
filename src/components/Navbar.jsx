import { useNavigate } from "react-router-dom";
import icitLogo from "../assets/icit-logo.png";
import { logout, isUserLoggedIn, refreshToken } from "../service/auth";
import { useEffect, useState } from "react";
import "../css/loading.css";

function Navbar() {
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    isUserLoggedIn().then((isLoggedIn) =>
      isLoggedIn ? setIsLogin(isLoggedIn) : navigate("/login")
    );
  }, [navigate]);

  useEffect(() => {
    const refreshTokenIfExpired = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const exp = localStorage.getItem("exp");
      if (exp -60 < currentTime) {
        refreshToken();
      }
    };

    refreshTokenIfExpired();

    const intervalId = setInterval(refreshTokenIfExpired, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className={`${isLogin ? "hidden" : ""} loader-wrapper`}>
        <span className="loader" />
      </div>

      <div className="h-full w-full py-1 shadow-[0px_5px_10px_0px_#62618E40]">
        <div className="container mx-auto px-2 md:px-6">
          <div className="flex justify-between items-center">
            <img
              src={icitLogo}
              width={80}
              height={80}
              alt="icit-logo"
              className="select-none"
            />
            <div className="flex items-center gap-2 md:gap-5">
              <p className="text-[16px] md:text-[18px] font-[500] text-[#004370]">
                {name ? name : ""}
              </p>
              <button
                onClick={handleLogout}
                className={`${
                  isLogin ? "" : "hidden"
                } text-[14px] md:text-[16px] h-full px-3 py-1  bg-[#1f5e95] text-white rounded-[18px]`}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
