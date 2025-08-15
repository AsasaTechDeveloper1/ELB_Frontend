import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[80%] mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
