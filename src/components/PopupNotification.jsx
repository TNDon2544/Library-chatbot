import { CloseOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { BellOutlined } from "@ant-design/icons";
import { useNameRoomAdmin, useRoomAdmin } from "../@hooks/globalState";
import { useEffect } from "react";

PopupNotification.propTypes = {
  socket: PropTypes.object.isRequired,
  closePopup: PropTypes.func.isRequired,
  notification: PropTypes.array.isRequired,
};

function PopupNotification({ closePopup, socket, notification }) {
  const { roomAdmin, setRoomAdmin } = useRoomAdmin();
  const { setNameRoomAdmin } = useNameRoomAdmin();

  const handleClickNotification = (room_id, room_name) => {
    socket.emit("leave_room", roomAdmin);
    setRoomAdmin(room_id);
    setNameRoomAdmin(room_name);
    closePopup();
  };

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 flex justify-center content-center">
      <div
        className="absolute top-0 bottom-0 left-0 right-0 bg-[#00000040] backdrop-blur-[4px]"
        onClick={closePopup}
      />
      <div className="relative z-[0] w-[320px] md:w-[520px] h-[300px] rounded-[10px] bg-[#FFFFFF] mx-auto my-auto">
        <div
          onClick={closePopup}
          className="absolute top-1 right-2 cursor-pointer"
        >
          <CloseOutlined />
        </div>
        <div className="absolute top-2 left-5 md:left-9 font-[500] text-lg">
        การแจ้งเตือน
        </div>
        <div className="mt-7 md:mt-3 p-3 md:p-7">
          <div className="lg:pt-4 h-[250px] overflow-auto">
            {notification?.map((item,index) => (
              <div
                onClick={() => handleClickNotification(item.id_user, item.name)}
                key={index}
                className="cursor-pointer hover:bg-[#5A6ACE26] hover:rounded-[10px] p-2 flex items-start gap-5 border-b-[1px]"
              >
                <div className="flex items-center gap-2 border-[#E0E0E0] pb-1">
                  <div className="flex justify-center items-center bg-[#1f5e95] w-9 h-9 rounded-full">
                    <BellOutlined className="text-[20px] text-white" />
                  </div>
                  <div>
                    <div className="font-[500]">
                      {item.name} ต้องการคุยกับ Admin
                    </div>
                    <div className="text-[#828282] text-[12px] font-[500]">
                      {item.create_time
                        ? format(
                            new Date(item.create_time).toLocaleString("en-US", {
                              timeZone: "UTC",
                            }),
                            "dd-MM-yyyy HH:mm"
                          )
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopupNotification;
