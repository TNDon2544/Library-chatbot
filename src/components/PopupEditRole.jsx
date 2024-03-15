import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CaretDownOutlined, CloseOutlined } from "@ant-design/icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import Swal from "sweetalert2";
import { putMethod } from "../service/axiosFetchData";

PopupEditRole.propTypes = {
  closePopup: PropTypes.func.isRequired,
};

function PopupEditRole({ closePopup }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("a");
  const [roleDisplay, setRoleDisplay] = useState("Admin");
  const allRole = [
    { title: "Admin", value: "a" },
    { title: "Member", value: "m" },
  ];

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  const handleEditRole = async () => {
    try {
      await putMethod(`/updaterole/${userId}`, { role });
      Swal.fire({
        icon: "success",
        title: "Edit Role Success",
        showConfirmButton: false,
        timer: 2500,
      }).then(() => closePopup());
    } catch (error) {
      console.error("Error:", error);
      if (error.message === "Request failed with status code 404") {
        Swal.fire({
          title: "",
          text: "ไม่พบ USER ID",
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

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 flex justify-center content-center">
      <div
        className="absolute top-0 bottom-0 left-0 right-0 bg-[#00000040] backdrop-blur-[4px]"
        onClick={closePopup}
      />
      <div className="relative z-[0] w-[320px] md:w-[520px] h-[300px] rounded-[10px] bg-[#FFFFFF] mx-auto my-auto">
        <div
          onClick={closePopup}
          className="absolute top-2 right-3 cursor-pointer"
        >
          <CloseOutlined />
        </div>
        <div className="p-3 md:p-7">
          <p className="text-xl font-[600] text-[#1f5e95]">User Role Update</p>
          <div className="pt-4">
            <label htmlFor="userId" className="pt-[25px] select-none">
              USER ID
            </label>
            <input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              type="text"
              className="w-full h-[40px] rounded-[13px] border-[1px] border-[#ADC1CE] outline-none px-2"
            />
          </div>
          <div className="pt-4">
            <label className="pt-[25px] select-none">Role</label>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="cursor-pointer outline-none w-full">
                <div className="flex items-center justify-center relative cursor-pointer select-none text-center h-[40px] rounded-[13px] border-[1px] border-[#ADC1CE]">
                  <div>{roleDisplay}</div>
                  <CaretDownOutlined className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 text-[#828282]" />
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={0}
                  align="center"
                  className="relative z-[9999] w-[290px] md:w-[450px] h-fit px-[8px] py-[2px] md:py-[11px] bg-white rounded-[5px] border-[#DADCE0] border-[0.7px] shadow-[0px_8px_11px_0px_#00000040]"
                >
                  {allRole.map((role) => (
                    <DropdownMenu.Item
                      key={role.value}
                      className="group cursor-pointer select-none outline-none py-[8px] text-center data-[highlighted]:bg-[#F1F3F4]"
                      onClick={() => {
                        setRole(role.value);
                        setRoleDisplay(role.title);
                      }}
                    >
                      {role.title}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleEditRole}
              className="rounded-[10px] bg-[#1f5e95] hover:bg-[#386c9c] text-white px-4 py-2"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopupEditRole;
