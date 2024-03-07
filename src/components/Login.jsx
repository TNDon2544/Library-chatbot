import loginBg from "../assets/login-bg.jpg";
import icitAccount from "../assets/icit_account_logo.png";
import emailIcon from "../assets/letter-icon.svg";
import passWordIcon from "../assets/lock-icon.svg";
import { useEffect, useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { logout } from "../service/auth";
import { useRoomAdmin } from "../@hooks/globalState";

function Login() {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  const schema = z.object({
    email: z.string().min(1, { message: "กรุณากรอกชื่อบัญชีผู้ใช้งาน" }),
    password: z.string().min(1, { message: "กรุณากรอกรหัสผ่านให้ถูกต้อง" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const [visible, setvisible] = useState(false);
  const navigate = useNavigate();
  const { setRoomAdmin } = useRoomAdmin();

  useEffect(() => {
    setRoomAdmin("");
    logout();
  }, [setRoomAdmin]);

  const getlogin = async (username, password) => {
    try {
      const response = await axios.post(
        "https://auth-api-backend-411408.uc.r.appspot.com/login",
        { username, password }
      );
      // console.log("Authentication Response:", response.data);
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        localStorage.setItem("name", decoded.userInfo.displayname);
        localStorage.setItem("username", decoded.userInfo.username);
        localStorage.setItem("exp", decoded.exp);
      }
      Swal.fire({
        icon: "success",
        title: "Login Success",
        showConfirmButton: false,
        timer: 2500,
      }).then(() => {
        navigate("/home");
      });
    } catch (error) {
      console.error("Error:", error);
      if (error.message === "Request failed with status code 401") {
        Swal.fire({
          title: "",
          text: "ชื่อบัญชีผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง",
          icon: "error",
          confirmButtonColor: "#1f5e95",
          confirmButtonText: "OK",
        });
        return;
      }
      Swal.fire({
        title: "",
        text: error,
        icon: "error",
        confirmButtonColor: "#1f5e95",
        confirmButtonText: "OK",
      });
    }
  };

  const handleLogin = (email, password) => {
    getlogin(email, password);
  };

  // useEffect(() => {
  //   getlogin("s6203051613174","thanadon2544");
  // }, []);

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit((data) =>
          handleLogin(data.email, data.password)
        )}
      >
        <img
          src={loginBg}
          alt="login-bg"
          className="w-full h-[100vh] object-cover select-none"
        />

        <div className="max-sm:w-[330px] max-md:w-[450px] w-[600px] h-[500px] pt-[150px] px-[20px] md:px-[40px] rounded-[25px] shadow-[-4px_30px_43px_0px_#314C8140] bg-white absolute left-1/2 transform -translate-x-1/2 top-[100px]">
          <img
            src={icitAccount}
            alt="icitAccount"
            className="absolute top-[30px] left-1/2 transform -translate-x-1/2 select-none w-[260px] h-[110px]"
          />
          <div className="flex items-center gap-4">
            <label htmlFor="email" className="pt-[25px] select-none">
              <img src={emailIcon} alt="emailIcon" width={30} height={30} />
            </label>
            <input
              className="w-full h-[60px] pt-[25px] border-b-[1px] focus:outline-none border-[#ADB7BE] font-[500] text-[16px] pr-[40px]"
              placeholder="ชื่อบัญชีผู้ใช้งาน"
              type="text"
              id="email"
              {...register("email")}
            />
          </div>
          {errors.email?.message && (
            <p className="text-red-500 font-[400] text-[12px] leading-[15px] ml-[14%] md:ml-[8%] mt-[4px]">
              {errors.email?.message}
            </p>
          )}
          <div className="flex items-center gap-4 mt-[20px] relative">
            <label htmlFor="password" className="pt-[25px] select-none">
              <img
                src={passWordIcon}
                alt="passWordIcon"
                width={30}
                height={30}
              />
            </label>
            <input
              className="w-full h-[60px] pt-[25px] border-b-[1px] focus:outline-none border-[#ADB7BE] font-[500] text-[16px] pr-[40px]"
              placeholder="รหัสผ่าน"
              type={visible ? "text" : "password"}
              id="password"
              {...register("password")}
            />
            <span
              className="text-[#ADB7BE] text-[25px] absolute top-[65%] transform -translate-y-1/2 right-0 cursor-pointer"
              onClick={() => setvisible(!visible)}
            >
              {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </span>
          </div>
          {errors.password?.message && (
            <p className="text-red-500 font-[400] text-[12px] leading-[15px] ml-[14%] md:ml-[8%] mt-[4px]">
              {errors.password?.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full h-[62px] rounded-[33px] bg-[#1f5e95] hover:bg-[#2b5477] text-white font-[700] text-[17px] mt-[60px]"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
