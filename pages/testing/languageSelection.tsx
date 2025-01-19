import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../pollingBooth/navbar";
import { detectTimeSpentOnTask } from "../../components/interactionMonitor"; // Adjust path to the actual location of the file

const LanguageSelection = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  

  useEffect(() => {
    // Pass CSS classes to the method
    detectTimeSpentOnTask(
      [
        'scale-125', 
        'text-5xl', 
        'duration-500'
      ], 
      (data: any) => {
        console.log(`User spent time on button:`, data);
      }
    );
  }, []);

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale).then(() => {
      console.log("Language changed to:", locale);
      router.push("/pollingBooth/voterAuthentication", undefined, { locale });
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <main className="flex flex-col items-center justify-center flex-grow px-6">
        <h2 className="text-center my-12 text-[#003366]">
          <div className="text-5xl font-semibold mb-6">
            <span>Please select the language</span>
          </div>
          <div className="text-5xl font-semibold mb-6">
            <span>ඔබට අවශ්‍ය භාෂාව තෝරන්න</span>
          </div>
          <div className="text-5xl font-semibold mb-6">
            <span>தயவுசெய்து மொழியைத் தேர்வு செய்யுங்கள்</span>
          </div>
        </h2>

        <div className="space-y-6  ">
          <button
            onClick={() => handleLanguageChange("si")}
            className="w-80 bg-[#800000] text-white py-6 rounded-full shadow-lg text-2xl font-bold  transition-transform mx-8"
          >
            සිංහල
          </button>
          <button
            onClick={() => handleLanguageChange("ta")}
            className="w-80 bg-[#006400] text-white py-6 rounded-full shadow-lg text-2xl font-bold  transition-transform mx-8"
          >
            தமிழ்
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className="w-80 bg-[#003366] text-white py-6 rounded-full shadow-lg text-2xl font-bold  transition-transform mx-8"
          >
            English
          </button>
        </div>
      </main>
    </div>
  );
};

// Preload translations for the page
export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default LanguageSelection;
