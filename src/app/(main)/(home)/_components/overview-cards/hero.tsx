"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";

import { useState } from "react";
import { CameraIcon } from "../../../profile/_components/icons";
import { SocialAccounts } from "../../../profile/_components/social-accounts";

export default function MainHero() {
  const [data, setData] = useState({
    name: "Danish Heilium",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/plane.jpg", 
  });

  const handleChange = (e: any) => {
    if (e.target.name === "profilePhoto" ) {
      const file = e.target?.files[0];

      setData({
        ...data,
        profilePhoto: file && URL.createObjectURL(file),
      });
    } else if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];

      setData({
        ...data,
        coverPhoto: file && URL.createObjectURL(file),
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  return ( 
    <div className="w-full">
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data?.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={1200}
            height={160}
            style={{
              width: "auto",
              height: "auto",
            }} 
          /> 
          <div className="absolute left-6 bottom-45 z-10 text-white max-w-[60%]">
            <h1 className="text-4xl font-extrabold drop-shadow-lg">
              Electronic Log Book 
            </h1>
            <p className="absolute left-0 top-[50px] text-base font-medium drop-shadow-md leading-relaxed max-w-[100%]">
              Track maintenance, oil, fuel, and damage of the airplane.
              Keep your aircraft in top condition with timely inspections.
            </p>
          </div>
          <div className="absolute bottom-1 left-5 z-10 xsm:bottom-4 xsm:right-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="coverType"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-opacity-90"
              >
                <input
                  type="file"
                  name="coverType"
                  id="coverType"
                  className="sr-only"
                  onChange={handleChange}
                  accept="image/png, image/jpg, image/jpeg"
                />
                <span>ACFT TYPE</span>
              </label>

              <label
                htmlFor="coverEngine"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-opacity-90"
              >
                <input
                  type="file"
                  name="coverEngine"
                  id="coverEngine"
                  className="sr-only"
                  onChange={handleChange}
                  accept="image/png, image/jpg, image/jpeg"
                />
                <span>ENGINE</span>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}