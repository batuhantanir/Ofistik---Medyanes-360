import React, { memo, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import "./style.css";
import WhiteBoardMain from "./whiteBoardMain";

const MainScreen = memo(
  ({
    joined,
    setJoined,
    joinRoom,
    localTracks,
    handleScreenShare,
    users,
    handleWhiteBoardShare,
    whiteBoardShareRef,
    UID,
    screenShareRef,
    roomToken,
    uuid,
  }) => {
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);

    const openWhiteboard = () => {
      setWhiteboardOpen(true);
    };

    const closeWhiteboard = () => {
      setWhiteboardOpen(false);
    };

    const stringUid = UID.toString();

    return (
      <div
        id="video-holder"
        className="relative h-[90vh] overflow-y-auto w-full flex flex-wrap justify-center p-2 gap-4 lg:p-4 lg:w-[65vw] bg-gray-200"
      >
        {/* Share Screen */}
        {roomToken &&
          UID &&
          uuid &&
          whiteboardOpen && ( // Whiteboard açık olduğunda göster
            <div className="whiteBoard">
              <WhiteBoardMain
                roomToken={roomToken}
                uid={stringUid}
                uuid={uuid}
                whiteBoardShareRef={whiteBoardShareRef}
              />
            </div>
          )}
        <div
          ref={screenShareRef}
          id="share-screen"
          className={`hidden top-0 left-0 !w-[100%] h-[60vh] bg-gray-200`}
        ></div>

        {/* People */}
        <div className="userVideo flex items-center justify-center">
          {users.map((user) => (
            <VideoPlayer key={user.uid} user={user} UID={UID} />
          ))}
        </div>
        {/* Join Stream */}
        <div className="w-full fixed bg-slate-300/10 py-2 z-10 bottom-0 flex justify-center">
          {joined === true ? (
            <div className="flex items-center justify-center gap-4">
              {/* Whiteboard açma/kapatma butonu */}
              <div id="whiteBoard">
                <button
                  onClick={() => {
                    handleWhiteBoardShare();
                    if (whiteboardOpen) {
                      closeWhiteboard();
                    } else {
                      openWhiteboard();
                    }
                  }}
                  className={`p-2 whiteBoardButton rounded-md cursor-pointer bg-premiumOrange text-white hover:bg-gray-200 hover:text-premiumOrange transition-all duration-500 ${
                    whiteboardOpen ? "bg-premiumOrange" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </button>
              </div>
              {/* Kamera Butonu */}
              <div
                id="camera"
                className={`p-2 rounded-md cursor-pointer bg-premiumOrange text-white hover:bg-gray-200 hover:text-premiumOrange transition-all duration-500`}
                onClick={async () => {
                  const camera = document.getElementById("camera");
                  const videoDiv =
                    document.getElementsByClassName("videoPlayer");
                  if (localTracks.video.muted) {
                    await localTracks.video.setMuted(false);
                    camera.classList.add("bg-orange-800");
                    videoDiv.innerHTML = `<Image
                    src={require(user)}
                    width={100}
                    height={100}
                    />`;
                  } else {
                    await localTracks.video.setMuted(true);
                    camera.classList.remove("bg-orange-800");
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
              </div>
              {/* Mikrofon Butonu */}
              <div
                id="mic"
                className="p-2 rounded-xl cursor-pointer bg-premiumOrange text-gray-100 hover:bg-gray-200 hover:text-premiumOrange transition-all duration-500"
                onClick={async () => {
                  const mic = document.getElementById("mic");

                  if (localTracks.audio.muted) {
                    await localTracks.audio.setMuted(false);
                    mic.classList.add("bg-orange-800");
                  } else {
                    await localTracks.audio.setMuted(true);
                    mic.classList.remove("bg-orange-800");
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              {/* Ekran Paylaş Butonu */}
              <div
                id="screen-share"
                className={`rounded-xl cursor-pointer bg-premiumOrange text-gray-100 hover:bg-gray-200 hover:text-premiumOrange transition-all duration-500 p-2`}
                onClick={handleScreenShare}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <button
              className=" rounded-md bg-orange-500 px-3 py-3 font-bold"
              onClick={() => {
                setJoined("load");
                joinRoom();
              }}
            >
              {joined === "load" ? "Requesting..." : "Toplantıyı Başlat"}
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default MainScreen;