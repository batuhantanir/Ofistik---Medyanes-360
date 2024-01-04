'use client'
import React, { useState } from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

function Card({
  image,
  name,
  status,
  category,
  starNumber,
  job,
  videoNumber,
  callNumber,
  language,
  skills,
  showedSkillsNumber,
  price,
  apointmentDate,
  commentNumber,
  minSessionTime,
}) {
  const [isHeartAnimating, setHeartAnimating] = useState(false);

  const heartAnimation = () => {
    setHeartAnimating(!isHeartAnimating);
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < starNumber; i++) {
      // yıldız sayısı kadar yıl font u ekliyor
      stars.push(
        <i key={i} className="fa-solid fa-star text-blueOne text-center"></i>
      );
    }

    return stars;
  };

  return (
    <div>
      <div className="text-center justify-between flex flex-col">
        <div className="favAndShareArea ml-auto">
          <div className="favAndShareButtons">
            <button
              onClick={heartAnimation}
              className={`fav  text-xs ${
                isHeartAnimating ? "animating text-redOne" : "text-favShare"
              }`}
            >
              <i
                className={`fav text-xs ${
                  isHeartAnimating ? "fa-solid fa-heart" : "fa-regular fa-heart"
                }`}
              ></i>
            </button>
            <button className="share text-favShare text-sm ml-3">
              <i className="fa-solid fa-arrow-up-from-bracket"></i>
            </button>
          </div>
        </div>
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="relative imageArea w-full flex flex-col items-center justify-center">
              <span
                className={`absolute h-5 w-5 ${
                  status === 1 ? "bg-blueOne" : "bg-redOne"
                } rounded-full top-4 point right-[87px] border-white border-4`}
              ></span>
              <Link href={"/"}>
                <img
                  src={image}
                  className={`w-28 h-28 rounded-full ${
                    status !== undefined
                      ? `border-2 ${
                          status === 1 ? "border-blue-600" : "border-red-600"
                        }`
                      : ""
                  }`}
                  alt=""
                />
              </Link>
              {status !== undefined && (
                <span
                  className={`bg-white bg-lightBlue ${
                    status === 1 ? "text-blue-600" : "text-red-600"
                  } px-3 py-1 rounded-2xl text-sm border-${
                    status === 1 ? "blue-600" : "red-600"
                  } border relative bottom-3.5`}
                >
                  {status === 1 ? "Çevrim içi" : "Meşgul"}
                </span>
              )}
            </div>
            <div className="starArea">{renderStars()}</div>
            <div className="commentArea">
              <h3 className="underline font-medium">{`${commentNumber}. Yorum`}</h3>
            </div>
            <div className="nameArea mt-1">
              <Link href={"/"}>
                <h3 className="text-center font-semibold">{name}</h3>
              </Link>
            </div>
            <div className="jobArea mt-2">
              <h4 className="text-center font-normal text-gray-600 text-sm">
                {job}
              </h4>
            </div>
            <div className="infoArea flex justify-center mt-2">
              <div className="videoCall ml-2">
                <i className="fa-solid fa-video text-infoIcon"></i>
                <span className="ml-2 font-normal text-xs mb-2">
                  {videoNumber}
                </span>
              </div>
              <div className="call ml-2">
                <i className="fa-solid fa-phone text-infoIcon"></i>
                <span className="ml-2 font-normal text-xs mb-1">
                  {callNumber}
                </span>
              </div>
              <div className="language ml-2">
                <i className="fa-solid fa-globe text-infoIcon"></i>
                <span className="ml-2 font-normal text-xs mb-1">
                  {language}
                </span>
              </div>
            </div>
            <div className="h-[128px]">
              <div className="skillsArea mt-2 flex flex-wrap justify-center text-sm h-auto">
                {skills.slice(0, showedSkillsNumber).map((skill, index) => (
                  <Link
                      href={"/"}
                    className="m-1 h-[24px]  my-1 rounded-full bg-skillsBg px-3 py-1 text-xs font-myBold text-themeBlack hover:border-transparent hover:bg-gray-200"
                    key={index}
                  >
                    {skill}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="viewProfileArea mt-1">
            <button className=" font-semibold border-b-2 p-2.5">
              Profili İncele<i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
        <div className="priceArea flex text-center justify-center m-3 mb-0 mt-1">
          <h4 className="font-semibold text-sm md:text-base my-auto">₺{price}/Seans</h4>
          <h4 className="ml-2 text-xs my-auto md:text-sm">
            {" "}
            {`(Minimum ${minSessionTime} dakika)`}
          </h4>
        </div>
        <div className="my-2 flex flex-col gap-2">
          {status === 1 ? (
            <Button className="flex flex-1">
              Hemen Randevu Al
            </Button>
          ) : (
            <Button className="flex flex-1">
              Randevu Al
            </Button>
          )}
          <div className="flex justify-between gap-2">
            <Button className="flex flex-1">
              Mesaj Gönder
            </Button>
            <Button className="flex flex-1">
              Takip Et
            </Button>
          </div>
        </div>
        <div className="infoTextArea">
          {status !== undefined && (
            <h5
              className={`${
                status === 1 ? "text-muted-foreground" : "text-destructive"
              } text-xs font-medium`}
            >
              {status === 1
                ? `*${name} şuan musait, randevu al butonuna tıklayarak hemen hizmet alabilirsiniz.`
                : `*${name} şuan musait değil, en yakın seansı: ${apointmentDate}`}
            </h5>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;