import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Calender Page",
  // other metadata
};

const CalendarPage = async () => {
  await requireAuth();
  // will redirect if no token
  return (
    <>
      <Breadcrumb pageName="Calendar" />
      <CalendarBox />
    </>
  );
};

export default CalendarPage;
