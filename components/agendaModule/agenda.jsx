"use client";
import React, { useEffect, useState } from "react";
import EventModal from "../commonModules/eventModal";
import "../../style/agenda.css";
import Swal from "sweetalert2";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import CardMobile from "./cardMobile";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { getAPI, postAPI } from "@/services/fetchAPI";

function Agenda() {
  const [formData, setFormData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("");
  const [alphabetic, setAlphabetic] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false); //ekranın mobil olup olmadığını kontrol ettiğimiz değişken
  const isMobileForAnimation = useMediaQuery(768);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [comingAppointments, setComingAppointments] = useState([]);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleOpenModal = (event) => {
    setSelectedEvent({
      ...event,
    });
    setOpenModal(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedFormData = formData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handleFilter = (selectedFilter) => {
    setAlphabetic(selectedFilter);
  };

  const filterFormData = (formData, filter, alphabetic) => {
    setPendingAppointments(
      formData.filter(
        (formEntry) =>
          formEntry.confirm === false &&
          isFutureAppointment(formEntry.time) &&
          formEntry.delete === false
      )
    );
    setComingAppointments(
      formData.filter(
        (formEntry) =>
          formEntry.confirm === true &&
          isFutureAppointment(formEntry.time) &&
          formEntry.delete === false
      )
    );
    const currentDate = new Date();
    const filteredData = formData.filter((data) => {
      const timeArray = data.time.split(" ");
      const appointmentDate = new Date(
        timeArray[0].split(".").reverse().join("-") + " " + timeArray[2]
      );

      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      switch (filter) {
        case "all":
          return true;
        case "cancelled":
          return data.delete === true;
        case "notConfirmed":
          return (
            (appointmentDate > currentDate ||
              (appointmentDate.getDate() === currentDate.getDate() &&
                new Date(`1970-01-01T${timeArray[2]}`) <
                new Date(
                  `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
                ))) &&
            data.confirm === false &&
            data.delete === false
          );
        case "past":
          return (
            (appointmentDate < currentDate ||
              (appointmentDate.getDate() === currentDate.getDate() &&
                new Date(`1970-01-01T${timeArray[2]}`) <
                new Date(
                  `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
                ))) &&
            data.delete === false
          );
        case "today":
          return (
            isSameDay(currentDateOnly, appointmentDate) && data.delete === false
          );
        case "future":
          return (
            appointmentDate > currentDate &&
            !isSameDay(currentDate, appointmentDate) &&
            data.delete === false
          );
        case "coming":
          return (
            (appointmentDate > currentDate ||
              (appointmentDate.getDate() === currentDate.getDate() &&
                new Date(`1970-01-01T${timeArray[2]}`) >
                new Date(
                  `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
                ))) &&
            data.delete === false
          );

        default:
          if (pendingAppointments.length > 0) {
            return (
              (appointmentDate > currentDate ||
                (appointmentDate.getDate() === currentDate.getDate() &&
                  new Date(`1970-01-01T${timeArray[2]}`) <
                  new Date(
                    `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
                  ))) &&
              data.confirm === false &&
              data.delete === false
            );
          } else if (comingAppointments.length > 0) {
            return (
              (appointmentDate > currentDate ||
                (appointmentDate.getDate() === currentDate.getDate() &&
                  new Date(`1970-01-01T${timeArray[2]}`) >
                  new Date(
                    `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
                  ))) &&
              data.delete === false
            );
          } else if (pendingAppointments.length === 0) {
            return true;
          }
      }
    });
    return filteredData;
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    setPendingAppointments(
      formData.filter(
        (formEntry) =>
          formEntry.confirm === false &&
          isFutureAppointment(formEntry.time) &&
          formEntry.delete === false
      )
    );
    setComingAppointments(
      formData.filter(
        (formEntry) =>
          formEntry.confirm === true &&
          isFutureAppointment(formEntry.time) &&
          formEntry.delete === false
      )
    );
  }, [formData]); // formData değiştiğinde tekrar çalışacak

  // kaydedilen randevuları databaseden al
  const getDatas = async (easy = false) => {
    const parsedFormData = await getAPI("/date");

    if (easy) {
      return parsedFormData;
    }

    const filteredFormData = filterFormData(parsedFormData, filter, alphabetic);

    if (filteredFormData) {
      let sortedFormData;

      if (alphabetic === "az") {
        sortedFormData = filteredFormData.sort((a, b) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
        );
      } else if (alphabetic === "za") {
        sortedFormData = filteredFormData.sort((a, b) =>
          b.firstName.toLowerCase().localeCompare(a.firstName.toLowerCase())
        );
      } else if (alphabetic === "new") {
        sortedFormData = filteredFormData.sort((a, b) => {
          const dateA = new Date(
            a.time.split(" ")[0].split(".").reverse().join("-") +
            " " +
            a.time.split(" ")[2]
          );
          const dateB = new Date(
            b.time.split(" ")[0].split(".").reverse().join("-") +
            " " +
            b.time.split(" ")[2]
          );

          return dateA - dateB;
        });
      } else if (alphabetic === "old") {
        sortedFormData = filteredFormData.sort((a, b) => {
          const dateA = new Date(
            a.time.split(" ")[0].split(".").reverse().join("-") +
            " " +
            a.time.split(" ")[2]
          );
          const dateB = new Date(
            b.time.split(" ")[0].split(".").reverse().join("-") +
            " " +
            b.time.split(" ")[2]
          );

          return dateB - dateA;
        });
      } else {
        sortedFormData = filteredFormData.sort((a, b) => {
          const dateA = new Date(
            a.time.split(" ")[0].split(".").reverse().join("-") +
            " " +
            a.time.split(" ")[2]
          );
          const dateB = new Date(
            b.time.split(" ")[0].split(".").reverse().join("-") +
            " " +
            b.time.split(" ")[2]
          );

          return dateA - dateB;
        });
      }

      setFormData(sortedFormData);
    }

    return filterFormData
  };

  useEffect(() => {
    getDatas();
  }, [filter]);

  useEffect(() => {
    setPendingAppointments(
      formData.filter(
        (formEntry) =>
          formEntry.confirm === false &&
          isFutureAppointment(formEntry.time) &&
          formEntry.delete === false
      )
    );
    setComingAppointments(
      formData.filter(
        (formEntry) =>
          formEntry.confirm === true &&
          isFutureAppointment(formEntry.time) &&
          formEntry.delete === false
      )
    );
  }, [formData, alphabetic]);

  useEffect(() => {
    const buttons = document.querySelectorAll(".rbc-button-link");

    if (buttons) {
      buttons.forEach((button) => {
        const spanElement = button.querySelector("span[role='columnheader']");

        if (isMobile && spanElement) {
          const originalText = spanElement.textContent;
          const datePart = originalText.split(" ")[0];
          spanElement.textContent = datePart;
        }
      });
    }
  }, [isMobile]);

  useEffect(() => {
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, []);

  function calculateEndTime(startTime, duration) {
    const durationMinutes = parseInt(duration, 10);
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = Math.floor((minutes + durationMinutes) / 60);
    const endMinutes = (minutes + durationMinutes) % 60;
    const endTime = `${hours + endHours}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
    return endTime;
  }

  const joinMeet = (formEntry, remainingHours) => {
    //KATIL BUTONUNA BASTIĞIMIZDA ÇALIŞSAN FONKSİYON RANDEVU DETAYLARINI DÖNDÜRÜYOR İÇİNDE RANDEVU NUMARASI VAR ONA GÖRE MEET ALANINA YÖLENDİRME YAPILACAK
    if (formEntry.confirm === false) {
      Swal.fire({
        title: "Hata !",
        text: "Randevuye katılmak için randevuyu işleme almanız gerekmektedir.",
        icon: "error",
        confirmButtonText: "Kapat",
      });
    } else {
      if (remainingHours > 1) {
        Swal.fire({
          title: "Hata !",
          text: "Randevuye 1 saat kala katılabilirsiniz.",
          icon: "error",
          confirmButtonText: "Kapat",
        });
      } else {
        window.location.href = `/meet/${formEntry.id}`; //RANDEVU EKRANINA YÖNLENDİRME LİNKİ RANDEVU NUMARASI KULLANARAK
      }
    }
  };
  const [showButtonsArea, setShowButtonsArea] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const toggleButtonsArea = (formEntry) => {
    if (selectedAppointment && selectedAppointment.id === formEntry.id) {
      setSelectedAppointment(null);
    } else {
      setShowButtonsArea(true);
      setSelectedAppointment(formEntry);
    }
  };

  function convertFormDataToTable() {
    return paginatedFormData.map((formEntry, index) => {
      const status = formEntry.confirm;
      const { time, duration, service } = formEntry;
      const parsedInfos = time.split(/\s+/);

      const dateInfo = parsedInfos[0] + " " + parsedInfos[1];
      const timeInfo = getTime(parsedInfos[2], duration);
      const remainingTime = getRemainingTime(time);
      const fullRemainingTime =
        remainingTime.remainingHours > 0
          ? `${remainingTime.remainingHours} saat ${remainingTime.remainingMinutes} dakika`
          : remainingTime.remainingMinutes > 0
            ? `${remainingTime.remainingMinutes} dakika`
            : "-";
      const requestStatus = parsedInfos[3];
      const currentDate = new Date();
      const appointmentDate = new Date(
        time.split(" ")[0].split(".").reverse().join("-") +
        " " +
        time.split(" ")[2]
      );
      const isPastAppointment =
        appointmentDate < currentDate ||
        (appointmentDate.getDate() === currentDate.getDate() &&
          new Date(`1970-01-01T${parsedInfos[2]}`) <
          new Date(
            `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
          ));

      const onAccept = async (timeObject) => {
        // RANDEVU TALEBİNİ KABUL ETME FONKSİYONUNU request değerini false yapıyor
        const data = await getDatas(true);
        const originalObje = data.filter(({ id }) => id === timeObject)[0];
        Swal.fire({
          title: "Emin misiniz!",
          text: "Randevu talebini kabul etmek istediğinize emin misiniz?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Evet",
          cancelButtonText: "Hayır",
        }).then(async (result) => {
          if (result.isConfirmed) {
            if (originalObje) {
              const falseValue2 = originalObje.confirm;
              const updatedValue2 = falseValue2 === false ? true : "";

              const newData = await postAPI(
                "/date",
                {
                  id: timeObject,
                  data: {
                    confirm: updatedValue2,
                  },
                },
                "PUT"
              )
              setFormData(newData)
            }
          }
        });
        return null;
      };

      const onReject = () => {
        // RANDEVU TALEBİNİ RED ETME FONKSİYONUNU DİREK FORMDATA DAN O ÖGEYİ SİLİYOR
        Swal.fire({
          title: "Emin misiniz!",
          text: "Randevu talebini silmek istediğinize emin misiniz?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Evet",
          cancelButtonText: "Hayır",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const data = await getDatas(true);
            const originalObje = data.filter(({ id }) => id === timeObject)[0];

            if (originalObje) {
              const data = await postAPI(
                "/date",
                {
                  id: timeObject,
                  data: {
                    delete: true,
                    confirm: false,
                  },
                },
                "PUT"
              )
              setFormData(data)
            }
          }
        });
      };

      const timeObject = formEntry.id;
      const isCancelDisabled = remainingTime.remainingHours < 12;
      const actualIndex = (currentPage - 1) * itemsPerPage + index;
      const isCancelled = formEntry.delete === true;
      const language = formEntry.language;
      const nameSurname = formEntry.firstName + " " + formEntry.lastName;
      return (
        <tr
          key={actualIndex}
          className={
            actualIndex % 2 === 0
              ? "bg-white md:text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]"
              : "bg-white md:text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]"
          }
        >
          <td className="text-center p-3 text-black font-medium">
            {actualIndex + 1}
          </td>
          <td className="text-center p-3 text-black font-medium">
            {formEntry.id}
          </td>
          <td className="text-center p-3 text-black font-medium">
            {nameSurname}
          </td>
          <td className="text-center p-3 text-black font-medium">{dateInfo}</td>
          <td className="text-center p-3 text-black font-medium">{timeInfo}</td>
          <td className="text-center p-3 text-black font-medium">{service}</td>
          <td className="text-center p-3 text-black font-medium">{language}</td>
          <td className="text-center status p-3 flex items-center justify-center">
            {isCancelled ? (
              <div className="flex justify-center items-center w-[150px] border-coral border bg-lightRed rounded-lg">
                <div className="p-1 flex">
                  <i className="fa-solid fa-circle text-coral text-[0.5rem] text-center flex items-center justify-center mx-2"></i>
                  <h1 className="text-center text-[0.65rem] lg:text-xs text-coral">
                    İptal Edildi
                  </h1>
                </div>
              </div>
            ) : isPastAppointment ? (
              <div className="flex items-center w-[150px] justify-center border-gray-500 border bg-gray-200 rounded-lg">
                <div className="flex p-1">
                  <i className="fa-solid fa-circle text-gray-500 text-[0.5rem] flex items-center justify-center mx-2"></i>
                  <h1 className="text-center text-[0.65rem] lg:text-xs text-gray-500">
                    Tamamlandı
                  </h1>
                </div>
              </div>
            ) : (
              <>
                {status === false && requestStatus === "false" && (
                  <div className="flex justify-center items-center w-[150px] border-orangeTable border bg-lightOrange2 rounded-lg">
                    <div className="p-1 flex">
                      <i className="fa-solid fa-circle text-orangeTable text-[0.5rem] text-center flex items-center justify-center mx-2 mt-[5px]"></i>
                      <h1 className="text-center text-[0.65rem] lg:text-xs text-orangeTable">
                        İşlem Bekleniyor
                      </h1>
                    </div>
                  </div>
                )}
                {status === true && (
                  <div className="flex items-center w-[150px] justify-center border-greenStatus border bg-lightGreen rounded-lg">
                    <div className="flex p-1">
                      <i className="fa-solid fa-circle text-greenStatus text-[0.5rem] flex items-center justify-center mx-2"></i>
                      <h1 className="text-center text-[0.65rem] lg:text-xs text-greenStatus">
                        Aktif
                      </h1>
                    </div>
                  </div>
                )}
                {requestStatus === "true" && status === false && (
                  <div className="flex justify-center items-center w-[150px] border-purpleStatus border bg-lightPurple rounded-lg">
                    <div className="p-1 flex">
                      <i className="fa-solid fa-circle text-purpleStatus text-[0.5rem] text-center flex items-center justify-center mx-2"></i>
                      <h1 className="text-center text-[0.65rem] lg:text-xs text-purpleStatus">
                        Onay Bekleniyor
                      </h1>
                    </div>
                  </div>
                )}
              </>
            )}
          </td>
          <td className={`text-center p-3 font-medium`}>
            <span
              className={`text-center mb-auto ${fullRemainingTime === "-" ? "" : ""
                }`}
            >
              {fullRemainingTime}
            </span>
          </td>
          <td className={`text-center p-3 font-medium `}>
            <div
              className="bg-lightGray rounded-full cursor-pointer threePoint"
              onClick={() => toggleButtonsArea(formEntry)}
            >
              <i class="fa-solid fa-ellipsis-vertical p-1"></i>
            </div>
            {showButtonsArea &&
              selectedAppointment &&
              selectedAppointment.id === formEntry.id && (
                <div className="absolute z-20 right-[8px] buttonsArea border-2 border-lightGray rounded-md bg-white animate__animated animate__zoomIn">
                  {!isCancelled && !isPastAppointment && status && (
                    <div className="items-center justify-center">
                      <div className="m-4">
                        <button
                          onClick={() =>
                            handleDelete(formEntry, isCancelDisabled)
                          }
                          className={`bg-lightGray text-black
                  rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                        >
                          <i class="fa-solid fa-ban mr-2 text-gray-600 font-semibold"></i>
                          İptal Et
                        </button>
                      </div>
                      <div className="m-4">
                        <button
                          onClick={() =>
                            joinMeet(formEntry, remainingTime.remainingHours)
                          }
                          className={`bg-lightGray text-black
                   rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                        >
                          <i class="fa-regular fa-user mr-2 text-gray-600 font-semibold"></i>
                          Katıl
                        </button>
                      </div>
                    </div>
                  )}
                  {status === false && !isCancelled && !isPastAppointment && (
                    <>
                      {requestStatus === "true" && (
                        <div className="m-4">
                          <button
                            onClick={() => onAccept(timeObject)}
                            className={`bg-lightGray text-black
                                      rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                          >
                            <i class="fa-solid fa-check mr-2 text-gray-600 font-semibold"></i>
                            Onayla
                          </button>
                        </div>
                      )}
                      {requestStatus === "false" && (
                        <div className="m-4">
                          <button
                            onClick={() => onAccept(timeObject)}
                            className={`bg-lightGray text-black
                                      rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                          >
                            <i class="fa-solid fa-check mr-2 text-gray-600 font-semibold"></i>
                            İşleme Al
                          </button>
                        </div>
                      )}
                      <div className="m-4">
                        <button
                          onClick={() => onReject(timeObject)}
                          className={`bg-lightGray text-black
                      rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                        >
                          <i class="fa-solid fa-xmark mr-2 text-gray-600 font-semibold"></i>
                          Reddet
                        </button>
                      </div>
                    </>
                  )}
                  <div className="m-4">
                    <button
                      // onClick={() => handleOpenModal(formEntry)} // MESAJ SAYFASINA YÖNLENDİRECEK ALAN
                      className={`bg-lightGray text-black
                    rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                    >
                      <i class="fa-solid fa-message mr-2 text-gray-600 font-semibold"></i>
                      Mesaj Gönder
                    </button>
                  </div>
                  <div className="m-4">
                    <button
                      onClick={() => handleOpenModal(formEntry)}
                      className={`bg-lightGray text-black
                    rounded-md flex text-xs 2xl:text-sm w-40 p-2 items-center justify-start`}
                    >
                      <i class="fa-solid fa-circle-info mr-2 text-gray-600 font-semibold"></i>
                      Detaylar
                    </button>
                  </div>
                </div>
              )}
          </td>
        </tr>
      );
    });
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const isOutsideButtonsArea =
        event.target.closest(".filters") === null &&
        event.target.closest(".filterArea") === null;

      if (isOutsideButtonsArea) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [setShowTooltip]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const isOutsideButtonsArea =
        event.target.closest(".buttonsArea") === null &&
        event.target.closest(".threePoint") === null;

      if (isOutsideButtonsArea) {
        setShowButtonsArea(false);
        setSelectedAppointment(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [setShowButtonsArea, setSelectedAppointment]);

  function getTime(start, duration) {
    const durationMinutes = parseInt(duration, 10);
    const [hours, minutes] = start.split(":").map(Number);
    const endHours = Math.floor((minutes + durationMinutes) / 60);
    const endMinutes = (minutes + durationMinutes) % 60;
    const endTime = `${hours + endHours}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
    return start + " - " + endTime;
  }

  function getRemainingTime(start) {
    //KALAN SAATİ HESAPLAYAN FONKSİYON
    const currentDate = new Date();
    const appointmentDate = new Date(
      start.split(" ")[0].split(".").reverse().join("-") +
      " " +
      start.split(" ")[2]
    );

    const remainingTimeInMilliseconds =
      appointmentDate.getTime() - currentDate.getTime();

    const remainingHours = Math.floor(
      remainingTimeInMilliseconds / (1000 * 60 * 60)
    );
    const remainingMinutes = Math.floor(
      (remainingTimeInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );
    const remainingSeconds = Math.floor(
      (remainingTimeInMilliseconds % (1000 * 60)) / 1000
    );

    return {
      remainingHours,
      remainingMinutes,
      remainingSeconds,
    };
  }

  function updateRemainingTime() {
    setFormData((prevFormData) =>
      prevFormData.map((formEntry) => {
        return {
          ...formEntry,
          remainingTime: getRemainingTime(formEntry.time),
        };
      })
    );
  }

  const getSelectedTimes = async () => {
    const times = await getAPI("/selectedtimes");
    return times;
  };

  const handleDelete = async (selectedAppointment, isCancelDisabled) => {
    //SİLME FONKSİYONU
    if (isCancelDisabled) {
      Swal.fire({
        title: "Hata !",
        text: "Randevu saatine 12 saatten az kaldığı için randevuyu iptal edemezsiniz.",
        icon: "error",
        confirmButtonText: "Kapat",
      });
      return;
    }
    Swal.fire({
      title: "Emin misiniz!",
      text: "Randevuyu iptal etmek istediğinize emin misiniz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Hayır",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const selectedTimes = await getSelectedTimes();

        const dateParts = selectedAppointment.time.split(" ");
        const datePart = dateParts[0].split(".");
        const timePart = dateParts[2];

        const year = parseInt(datePart[2], 10);
        const month = parseInt(datePart[1], 10) - 1;
        const day = parseInt(datePart[0], 10);

        const timeParts = timePart.split(":");
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);

        const originalDate = new Date(year, month, day, hours, minutes);

        const formattedDate = originalDate.toISOString().split("T")[0];
        const formattedTime = originalDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const result1 = {
          date: formattedDate,
          time: formattedTime,
        };

        Swal.fire({
          title: "Başarılı !",
          text: "Randevu başarılı bir şekilde silindi.",
          icon: "success",
          confirmButtonText: "Kapat",
        });

        const updatedSelectedTimes = selectedTimes.map((appointment) => {
          if (
            appointment.date === result1.date &&
            appointment.time === result1.time
          ) {
            return { ...appointment, active: true };
          }
          return appointment;
        });

        await postAPI("/selectedtimes", updatedSelectedTimes, "POST"); // GÜNCELLENMİŞ SAATLERİ YENİDEN DATABASE E GÖNDERECEĞİZ

        // Form datayı güncelle
        const dates = await getDatas(true);
        dates.forEach(async (appointment) => {
          if (
            appointment.date === selectedAppointment.date &&
            appointment.time === selectedAppointment.time
          ) {
            await postAPI(
              "/date",
              {
                id: appointment.id,
                data: {
                  delete: true,
                },
              },
              "PUT"
            );
          }
        });

        await getDatas();
      }
    });
  };

  // İki tarihin aynı gün olup olmadığını kontrol eden fonksiyon
  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(formData.length / itemsPerPage);

  function isFutureAppointment(time) {
    const currentDate = new Date();
    const appointmentDate = new Date(
      time.split(" ")[0].split(".").reverse().join("-") +
      " " +
      time.split(" ")[2]
    );
    return appointmentDate > currentDate;
  }
  const renderSwiper = (times) => {
    const itemsPerSlide = 2;
    const swiperSlides = [];

    const getDatas = async (easy = false) => {
      const parsedFormData = await getAPI("/date");

      if (easy) {
        return parsedFormData;
      }

      const filteredFormData = filterFormData(
        parsedFormData,
        filter,
        alphabetic
      );

      if (filteredFormData) {
        let sortedFormData;

        if (alphabetic === "az") {
          sortedFormData = filteredFormData.sort((a, b) =>
            a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
          );
        } else if (alphabetic === "za") {
          sortedFormData = filteredFormData.sort((a, b) =>
            b.firstName.toLowerCase().localeCompare(a.firstName.toLowerCase())
          );
        } else if (alphabetic === "new") {
          sortedFormData = filteredFormData.sort((a, b) => {
            const dateA = new Date(
              a.time.split(" ")[0].split(".").reverse().join("-") +
              " " +
              a.time.split(" ")[2]
            );
            const dateB = new Date(
              b.time.split(" ")[0].split(".").reverse().join("-") +
              " " +
              b.time.split(" ")[2]
            );

            return dateA - dateB;
          });
        } else if (alphabetic === "old") {
          sortedFormData = filteredFormData.sort((a, b) => {
            const dateA = new Date(
              a.time.split(" ")[0].split(".").reverse().join("-") +
              " " +
              a.time.split(" ")[2]
            );
            const dateB = new Date(
              b.time.split(" ")[0].split(".").reverse().join("-") +
              " " +
              b.time.split(" ")[2]
            );

            return dateB - dateA;
          });
        } else {
          sortedFormData = filteredFormData.sort((a, b) => {
            const dateA = new Date(
              a.time.split(" ")[0].split(".").reverse().join("-") +
              " " +
              a.time.split(" ")[2]
            );
            const dateB = new Date(
              b.time.split(" ")[0].split(".").reverse().join("-") +
              " " +
              b.time.split(" ")[2]
            );

            return dateA - dateB;
          });
        }

        setFormData(sortedFormData);
      }
    };

    const onAccept = async (timeObject) => {
      // RANDEVU TALEBİNİ KABUL ETME FONKSİYONUNU request değerini false yapıyor
      const data = await getDatas(true);
      const originalObje = data.filter(({ id }) => id === timeObject)[0];
      Swal.fire({
        title: "Emin misiniz!",
        text: "Randevu talebini kabul etmek istediğinize emin misiniz?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Evet",
        cancelButtonText: "Hayır",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (originalObje) {
            const falseValue2 = originalObje.confirm;
            const updatedValue2 = falseValue2 === false ? true : "";

            await postAPI(
              "/date",
              {
                id: timeObject,
                data: {
                  confirm: updatedValue2,
                },
              },
              "PUT"
            );
          }
        }
      });

      await getDatas();

      return null;
    };

    const onReject = () => {
      // RANDEVU TALEBİNİ RED ETME FONKSİYONUNU DİREK FORMDATA DAN O ÖGEYİ SİLİYOR
      Swal.fire({
        title: "Emin misiniz!",
        text: "Randevu talebini silmek istediğinize emin misiniz?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Evet",
        cancelButtonText: "Hayır",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const data = await getDatas(true);
          const originalObje = data.filter(({ id }) => id === timeObject)[0];

          if (originalObje) {
            await postAPI(
              "/date",
              {
                id: timeObject,
                data: {
                  delete: true,
                  confirm: false,
                },
              },
              "PUT"
            ).then(async () => {
              await getDatas();
            });
          }
        }
      });
    };

    for (let i = 0; i < times.length; i += itemsPerSlide) {
      const currentTimes = times.slice(i, i + itemsPerSlide);
      const swiperSlide = (
        <SwiperSlide key={i}>
          <div className="flex flex-wrap  justify-center h-auto agendaCardBoxArea">
            {currentTimes.map((formEntry, index) => {
              const status = formEntry.confirm;
              const { time, duration, service } = formEntry;
              const parsedInfos = time.split(/\s+/);
              const dateInfo = parsedInfos[0] + " " + parsedInfos[1];
              const timeInfo = getTime(parsedInfos[2], duration);
              const remainingTime = getRemainingTime(time);
              const requestStatus = parsedInfos[3];
              const currentDate = new Date();
              const appointmentDate = new Date(
                time.split(" ")[0].split(".").reverse().join("-") +
                " " +
                time.split(" ")[2]
              );
              const timeObject = formEntry.id;
              const isCancelDisabled = remainingTime.remainingHours < 12;
              const isPastAppointment =
                appointmentDate < currentDate ||
                (appointmentDate.getDate() === currentDate.getDate() &&
                  new Date(`1970-01-01T${parsedInfos[2]}`) <
                  new Date(
                    `1970-01-01T${currentDate.getHours()}:${currentDate.getMinutes()}`
                  ));
              const name =
                `${formEntry.firstName || ""} ${formEntry.lastName || ""
                  }`.trim() || "Bayram Çınar"; //DATA BASE DEN ALINAN GİRİŞ YAPMIŞ KULLANICI İSMİ
              const isCancelled = formEntry.delete;
              const isToday = isSameDay(appointmentDate, currentDate);

              return (
                <CardMobile
                  joinFunction={joinMeet}
                  joinMeet={joinMeet}
                  reject={() => onReject(timeObject)}
                  formEntry={formEntry}
                  remainingHours={remainingTime.remainingHours}
                  isToday={isToday}
                  isCancelled={isCancelled}
                  key={index}
                  id={formEntry.id}
                  name={name}
                  remainingTime={
                    remainingTime.remainingHours > 0 ? (
                      `${remainingTime.remainingHours} saat ${remainingTime.remainingMinutes} dakika`
                    ) : remainingTime.remainingMinutes > 0 ? (
                      <span>{`${remainingTime.remainingMinutes} dakika`}</span>
                    ) : (
                      <span>Randevu Bitti</span>
                    )
                  }
                  isPastAppointment={isPastAppointment}
                  requestStatus={requestStatus}
                  service={service}
                  onAccept={() => onAccept(timeObject)}
                  status={status}
                  time={timeInfo}
                  date={dateInfo}
                  showDetails={() => handleOpenModal(formEntry)}
                  deleteFunction={() =>
                    handleDelete(formEntry, isCancelDisabled)
                  }
                  isCancelDisabled={isCancelDisabled}
                />
              );
            })}
          </div>
        </SwiperSlide>
      );
      swiperSlides.push(swiperSlide);
    }

    const swiperProps = isMobile
      ? {
        direction: "horizontal",
        pagination: { clickable: true, dynamicBullets: true },
        modules: [Pagination, Navigation],
      }
      : {
        navigation: {
          prevEl: ".custom-swiper-button-prev",
          nextEl: ".custom-swiper-button-next",
        },
        modules: [Navigation],
      };

    return (
      <Swiper {...swiperProps} className="mySwiper">
        {swiperSlides}
      </Swiper>
    );
  };

  function getTableHeaders() {
    switch (filter) {
      case "past":
        return "Geçmiş Randevularım";
      case "cancelled":
        return "İptal Edilen Randevularım";
      case "today":
        return "Bugünki Randevularım";
      case "future":
        return "Gelecek Randevularım";
      case "coming":
        return "Yaklaşan Randevularım";
      case "notConfirmed":
        return "İşlem Bekleyen Randevularım";
      case "all":
        return "Tüm Randevularım";
      default:
        if (pendingAppointments.length > 0) {
          return "İşlem Bekleyen Randevularım";
        } else if (comingAppointments.length > 0) {
          return "Yaklaşan Randevularım";
        } else if (pendingAppointments.length === 0) {
          return "Tüm Randevularım";
        }
    }
  }

  const handlePageNumberChange = (event) => {
    setItemsPerPage(event.target.value);
  };

  const handleOpenFilter = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <>
      <div
        className={`bg-white lg:scale-[1] md:scale-[0.9] ${isMobileForAnimation ? "" : "animate__fadeInTopLeft"
          } animate__animated  rounded-xl max-[768px]:mx-auto max-[768px]:w-[23rem] mb-5 w-full flex-grow shadow-xl flex flex-col justify-between relative z-[2]`}
      >
        <div className="w-full overflow-auto max-h-600">
          <div className="block lg:flex items-center justify-center lg:justify-between m-4">
            <h1 className=" lg:text-[1.5vw] max-[768px]:text-xl text-center text-gray-600 font-semibold max-[768px]:pt-0 sticky top-0 pl-3">
              {getTableHeaders()}
            </h1>
            <div className="flex justify-center mt-2 lg:mt-0 lg:justify-end items-center text-xs md:text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]">
              {!isMobile && (
                <div className="filterArea mr-2">
                  <button
                    onClick={handleOpenFilter}
                    className="py-2 px-4 bg-gray-100 text-gray-500 rounded-lg"
                  >
                    <i class="fa-solid fa-filter text-premiumOrange"></i> Sırala
                  </button>
                  {showTooltip && (
                    <div className="tooltip filters animate__animated animate__zoomIn z-[3] bg-white border border-gray-300 p-2 rounded-xl shadow-lg absolute transform -translate-x-0 lg:top-16 lg:right-56 transition duration-300 top-24 ">
                      <h1 className="font-semibold text-center text-gray-600">
                        Sırala
                      </h1>
                      <div className="">
                        <div className="az my-3">
                          <button
                            className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full flex justify-start"
                            onClick={() => handleFilter("az")}
                          >
                            <i class="fa-solid fa-arrow-up-a-z mr-2"></i>Ad
                            Soyad (A-Z)
                          </button>
                        </div>
                        <div className="za">
                          <button
                            className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full  flex justify-start"
                            onClick={() => handleFilter("za")}
                          >
                            <i class="fa-solid fa-arrow-down-z-a mr-2"></i>Ad
                            Soyad (Z-A)
                          </button>
                        </div>
                        <div className="new my-3">
                          <button
                            className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full  flex justify-start"
                            onClick={() => handleFilter("old")}
                          >
                            <i class="fa-solid fa-arrow-up-wide-short mr-2"></i>
                            Tarih (Yeni - Eski)
                          </button>
                        </div>
                        <div className="old my-3">
                          <button
                            className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full  flex justify-start"
                            onClick={() => handleFilter("new")}
                          >
                            <i class="fa-solid fa-arrow-down-short-wide mr-2"></i>
                            Tarih (Eski - Yeni)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="relative ml-auto hidden lg:flex items-center justify-center">
                <input
                  type="text"
                  placeholder="Ara..."
                  className="border rounded-md p-1 focus:outline-none "
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <i className="fas fa-search text-gray-500"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="agendaCardSwiper">
            {!isMobile && (
              <div className="flex justify-center lg:justify-start items-center mb-4 lg:ml-4 flex-wrap md:text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]">
                <div
                  onClick={() => handleFilterChange("all")}
                  className={`p-1 border-b-2 ${filter === "all" ? "activeCategory" : ""
                    } border-gray-300 m-2 text-gray-500 cursor-pointer`}
                >
                  Tümü
                </div>
                <div
                  onClick={() => handleFilterChange("coming")}
                  className={`p-1 border-b-2 ${filter === "coming" ? "activeCategory" : ""
                    } border-gray-300 m-2 text-gray-500 cursor-pointer`}
                >
                  Yaklaşan
                </div>
                <div
                  onClick={() => handleFilterChange("past")}
                  className={`p-1 border-b-2 ${filter === "past" ? "activeCategory" : ""
                    } border-gray-300 m-2 text-gray-500 cursor-pointer`}
                >
                  Geçmiş
                </div>
                <div
                  onClick={() => handleFilterChange("today")}
                  className={`p-1 border-b-2 ${filter === "today" ? "activeCategory" : ""
                    } border-gray-300 m-2 text-gray-500 cursor-pointer`}
                >
                  Bugünkü
                </div>
                <div
                  onClick={() => handleFilterChange("cancelled")}
                  className={`p-1 border-b-2 ${filter === "cancelled" ? "activeCategory" : ""
                    } border-gray-300 m-2 text-gray-500 cursor-pointer`}
                >
                  İptal Edilen
                </div>

                <div className="dropdown-content flex">
                  <div
                    onClick={() => handleFilterChange("notConfirmed")}
                    className={`p-1 border-b-2 ${filter === "notConfirmed" ? "activeCategory" : ""
                      } border-gray-300 m-2 text-gray-500 cursor-pointer flex`}
                  >
                    {pendingAppointments.length > 0 && (
                      <i className="fa-solid fa-circle text-premiumOrange text-[0.5rem] flashing-text text-center flex items-center justify-center mr-2 mt-2"></i>
                    )}
                    İşlem Bekleyen
                  </div>
                </div>
              </div>
            )}
            {isMobile && (
              <div className="flex flex-row">
                {isMobile && (
                  <div className="flex justify-center items-center text-sm w-full ">
                    <select
                      onChange={(e) => handleFilterChange(e.target.value)}
                      value={filter}
                      className="p-1 border-b-2 border-gray-100 outline-none m-2 text-gray-500 cursor-pointer w-[50%]"
                    >
                      {pendingAppointments.length > 0 && (
                        <>
                          <option value="notConfirmed">İşlem Bekleyen</option>
                          <option value="all">Tümü</option>
                          <option value="coming">Yaklaşan</option>
                          <option value="past">Geçmiş</option>
                          <option value="today">Bugünkü</option>
                          <option value="cancelled">İptal Edilen</option>
                        </>
                      )}
                      {pendingAppointments.length === 0 &&
                        comingAppointments.length > 0 && (
                          <>
                            <option value="coming">Yaklaşan</option>
                            <option value="all">Tümü</option>
                            <option value="past">Geçmiş</option>
                            <option value="today">Bugünkü</option>
                            <option value="cancelled">İptal Edilen</option>
                            <option value="notConfirmed">İşlem Bekleyen</option>
                          </>
                        )}
                      {pendingAppointments.length === 0 &&
                        comingAppointments.length === 0 && (
                          <>
                            <option value="all">Tümü</option>
                            <option value="coming">Yaklaşan</option>
                            <option value="past">Geçmiş</option>
                            <option value="today">Bugünkü</option>
                            <option value="cancelled">İptal Edilen</option>
                            <option value="notConfirmed">İşlem Bekleyen</option>
                          </>
                        )}
                    </select>
                    {pendingAppointments.length > 0 && (
                      <i className="fa-solid fa-circle text-premiumOrange text-[0.5rem] flashing-text text-center flex items-center justify-center mr-2"></i>
                    )}
                    {isMobile && (
                      <div className="filterArea ml-3">
                        <button
                          onClick={handleOpenFilter}
                          className="py-2 px-4 bg-gray-100 text-gray-500 rounded-lg"
                        >
                          <i class="fa-solid fa-filter text-premiumOrange"></i>{" "}
                          Sırala
                        </button>
                        {showTooltip && (
                          <div className="tooltip filters animate__animated animate__zoomIn z-[3] bg-white border border-gray-300 p-2 rounded-xl shadow-lg absolute transform -translate-x-0 transition duration-300 top-28 right-5">
                            <h1 className="font-semibold text-center text-gray-600">
                              Sırala
                            </h1>
                            <div className="">
                              <div className="az my-3">
                                <button
                                  className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full flex justify-start"
                                  onClick={() => handleFilter("az")}
                                >
                                  <i class="fa-solid fa-arrow-up-a-z mr-2"></i>
                                  Ad Soyad (A-Z)
                                </button>
                              </div>
                              <div className="za">
                                <button
                                  className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full  flex justify-start"
                                  onClick={() => handleFilter("za")}
                                >
                                  <i class="fa-solid fa-arrow-down-z-a mr-2"></i>
                                  Ad Soyad (Z-A)
                                </button>
                              </div>
                              <div className="new my-3">
                                <button
                                  className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full  flex justify-start"
                                  onClick={() => handleFilter("old")}
                                >
                                  <i class="fa-solid fa-arrow-up-wide-short mr-2"></i>
                                  Tarih (Yeni - Eski)
                                </button>
                              </div>
                              <div className="old my-3">
                                <button
                                  className="bg-gray-100 text-gray-600 py-2 px-8 rounded-lg w-full  flex justify-start"
                                  onClick={() => handleFilter("new")}
                                >
                                  <i class="fa-solid fa-arrow-down-short-wide mr-2"></i>
                                  Tarih (Eski - Yeni)
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {!isMobile && (
              <table className="rounded-xl w-full ">
                <thead>
                  <tr className="sticky top-0 bg-lightGray text-gray-600 md:text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]">
                    <th className="p-3">Sıra</th>
                    <th className="p-3">Randevu Numarası</th>
                    <th className="p-3">Ad Soyad</th>
                    <th className="p-3">Tarih</th>
                    <th className="p-3">Saat</th>
                    <th className="p-3">Randevu</th>
                    <th className="p-3">Dil</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Kalan Süre</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>{convertFormDataToTable()}</tbody>
              </table>
            )}
            {isMobile && <>{renderSwiper(paginatedFormData)}</>}
          </div>
        </div>
        {!isMobile && (
          <div className="flex justify-between m-3 text-sm md:text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]">
            <div className="flex items-center justify-center">
              <select
                id="pageNumberSelect"
                className="px-2 py-1  font-medium rounded-lg bg-white border-2 border-gray-200 text-gray-600"
                onChange={handlePageNumberChange}
              >
                <option value="">Sayfa Sayısı</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
              </select>
              <h1 className=" text-gray-500 ml-2">
                Şuanda Gösterilen Sayı {itemsPerPage}
              </h1>
            </div>
            <ul className="flex space-x-2">
              <li
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-5 py-2 border w-[80px] h-[40px] flex items-center justify-center cursor-pointer rounded-xl ${currentPage === 1
                  ? "bg-grayBg text-gray-600 font-semibold"
                  : "border-grayBg"
                  }`}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Önceki
                </button>
              </li>

              {[...Array(totalPages).keys()].map((page) => (
                <li
                  key={page + 1}
                  onClick={() => handlePageChange(page + 1)}
                  className={`px-3 py-2 border w-[40px] h-[40px] flex items-center justify-center cursor-pointer rounded-xl ${page + 1 === currentPage
                    ? "bg-grayBg text-gray-600 font-semibold"
                    : "border-grayBg"
                    }`}
                >
                  <button onClick={() => handlePageChange(page + 1)}>
                    {page + 1}
                  </button>
                </li>
              ))}
              <li
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-5 py-2 border w-[80px] h-[40px] flex items-center justify-center cursor-pointer rounded-xl ${currentPage === totalPages
                  ? "bg-grayBg text-gray-600 font-semibold"
                  : "border-grayBg"
                  }`}
              >
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      <EventModal
        isOpen={openModal}
        onClose={handleCloseModal}
        event={selectedEvent}
        randevuTarih={selectedEvent && selectedEvent.time.split(" ")[0]}
        randevuSaat={selectedEvent && selectedEvent.time.split(" ")[2]}
        endSaat={
          selectedEvent &&
          calculateEndTime(
            selectedEvent.time.split(" ")[2],
            selectedEvent.duration
          )
        }
      />
    </>
  );
}

export default Agenda;
