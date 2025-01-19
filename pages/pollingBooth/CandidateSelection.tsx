import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Navbar from "./navbar";
import { detectTimeSpentOnTask } from "../../components/interactionMonitor";

// Simulate fetching candidate data from an API
const fetchCandidates = async () => {
  return [
    { id: 23, name: { en: "Anura Kumara Dissanayake", si: "අනුර කුමාර දිසානායක", ta: "அநுர குமார திசாநாயக்க" }, party: "NPP", symbol: "🌱" },
    { id: 17, name: { en: "Sajith Premadasa", si: "සජිත් ප්‍රේමදාස", ta: "சஜித் பிரேமதாச" }, party: "SJB", symbol: "🌟" },
    { id: 34, name: { en: "Ranil Wickremesinghe", si: "රනිල් වික්‍රමසිංහ", ta: "ரணில் விக்ரமசிங்க" }, party: "UNP", symbol: "⚖️" },
    { id: 14, name: { en: "Namal Rajapaksa", si: "නාමල් රාජපක්ෂ", ta: "நாமல் ராஜபக்ச" }, party: "SLPP", symbol: "🦁" },
    { id: 66, name: { en: "P. Ariyanethiran", si: "පී. අරියනේතිරන්", ta: "பி. அரியநேதிரன்" }, party: "DHH", symbol: "🏠" },
    { id: 36, name: { en: "Dilith Jayaweera", si: "දිලිත් ජයවීර", ta: "திலித் ஜயவீர" }, party: "FHH", symbol: "🏡" },
    { id: 67, name: { en: "K. K. Piyadasa", si: "කේ. කේ. පියදාස", ta: "கே. கே. பியதாச" }, party: "YUU", symbol: "📚" },
    { id: 8, name: { en: "D. M. Bandaranayake", si: "ඩී. එම්. බණ්ඩාරනායක", ta: "டி. எம். பண்டாரநாயக்க" }, party: "UII", symbol: "🌳" },
    { id: 9, name: { en: "Sarath Fonseka", si: "සරත් ෆොන්සේකා", ta: "சரத் பொன்சேகா" }, party: "RTT", symbol: "⚔️" },
    { id: 10, name: { en: "Wijeyadasa Rajapakshe", si: "විජයදාස රාජපක්ෂ", ta: "விஜயதாச ராஜபக்ச" }, party: "KNN", symbol: "🌊" },
  ];
};

const CandidateSelection = () => {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [isSpeakerEnabled, setSpeakerEnabled] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element to avoid conflicts

  // Handle audio play function for different actions
  const playAudio = (type: string) => {
    if (typeof window !== "undefined") { // Check if we're in the browser
      if (audioRef.current) {
        audioRef.current.pause(); // Pause any playing audio
        audioRef.current.currentTime = 0; // Reset to start
      }
      const audio = new Audio(`/audio/${type}_${locale}.mp3`);
      audioRef.current = audio; // Assign to ref to control it
      audio.play(); // Play the audio
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newAudioInstance = new Audio(); // Create new audio instance
      // setAudioInstance(newAudioInstance); // Store it in state

      // Load speaker state from localStorage
      const savedSpeakerState = localStorage.getItem("isSpeakerEnabled");
      if (savedSpeakerState !== null) {
        setSpeakerEnabled(JSON.parse(savedSpeakerState));
      }
    }
  }, []); 

  // Fetch candidates data on page load
  useEffect(() => {
    // Fetch candidates data on page load
    const fetchData = async () => {
      const data = await fetchCandidates();
      setCandidates(data);
    };
    fetchData();

    // Play initial rules audio if the speaker is enabled
    if (isSpeakerEnabled) {
      playAudio("rules");
    }

    // Cleanup: Stop audio when the component is unmounted
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [locale, isSpeakerEnabled]);

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

  // Handle candidate selection (selection, deselection, max selection)
  const handleCandidateSelection = (candidateId: number) => {
    const index = selectedCandidates.indexOf(candidateId);

    if (index !== -1) {
      const updatedSelection = selectedCandidates.filter((id) => id !== candidateId);
      setSelectedCandidates(updatedSelection);
      if (isSpeakerEnabled) playAudio("deselect");
    } else {
      if (selectedCandidates.length < 3) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
        if (isSpeakerEnabled) playAudio("select");
      }
      if (selectedCandidates.length === 2 && isSpeakerEnabled) {
        playAudio("max");
      }
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (selectedCandidates.length === 3) {
      if (isSpeakerEnabled) {
        playAudio("submit");
        if (audioRef.current) {
          audioRef.current.onended = () => {
            router.push({
              pathname: "/pollingBooth/ConfirmVote",
              query: { candidates: JSON.stringify(selectedCandidates) },
            });
          };
        }
      } else {
        // Navigate immediately if speaker is disabled
        router.push({
          pathname: "/pollingBooth/ConfirmVote",
          query: { candidates: JSON.stringify(selectedCandidates) },
        });
      }
    } else {
      alert(t("selectExactly3Alert"));
    }
  };
  

  // Speaker Toggle Handler
  const toggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem("isSpeakerEnabled", JSON.stringify(newState));
      } catch (error) {
        console.error("Error saving speaker state:", error);
      }
      return newState;
    });
  };

  // Play hover sound for submit button
  const handleHoverSubmitButton = () => {
    if (isSpeakerEnabled) playAudio("hover");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6]">
      <Navbar />

      <div className="p-6 bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6] text-[#003366] text-xl font-semibold">
        <h2 className="mb-4 text-4xl">{t("candidateSelectionRulesTitle")}</h2>
        <ul className="list-disc ml-8 text-2xl">
          <li>{t("select3CandidatesRule")}</li>
          <li>{t("clickToSelectCandidate")}</li>
          <li>{t("votePreferenceInstructions")}</li>
        </ul>
      </div>

      <main className="flex flex-col items-center justify-center flex-grow px-0">
        <div className="w-full max-w-full overflow-x-auto bg-gradient-to-b from-[#F1F1F1] to-[#B0D0E6] border-4 border-gray-300 shadow-lg rounded-lg">
          <table className="table-auto w-full border-collapse text-left text-xl">
            <thead className="bg-[#003366] text-white font-semibold text-2xl">
              <tr>
                <th className="px-8 py-6 border">{t("candidateNo")}</th>
                <th className="px-8 py-6 border">{t("candidateName")}</th>
                <th className="px-8 py-6 border">{t("partyName")}</th>
                <th className="px-8 py-6 border">{t("symbol")}</th>
                <th className="px-8 py-6 border text-center">{t("select")}</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-100 bg-white">
                  <td className="px-8 py-6 border text-center text-5xl">{candidate.id}</td>
                  <td className="px-8 py-6 border">
                    <div className="text-2xl font-bold">{candidate.name.en}</div>
                    <div className="text-2xl font-bold">{candidate.name.si}</div>
                    <div className="text-2xl font-bold">{candidate.name.ta}</div>
                  </td>
                  <td className="px-8 py-6 border text-2xl font-bold">{candidate.party}</td>
                  <td className="px-8 py-6 border text-center text-7xl">{candidate.symbol}</td>
                  <td className="px-8 py-6 border text-center">
                    <button
                      className={`w-20 h-20 ${selectedCandidates.includes(candidate.id) ? "bg-blue-600 text-white" : "bg-transparent border-4 border-gray-400"} rounded-full text-4xl font-bold`}
                      onClick={() => handleCandidateSelection(candidate.id)}
                    >
                      {selectedCandidates.includes(candidate.id)
                        ? selectedCandidates.indexOf(candidate.id) + 1
                        : ""}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSubmit}
          onMouseEnter={handleHoverSubmitButton} // Trigger hover audio
          className="w-96 bg-[#003366] text-white py-8 rounded-full shadow-lg text-3xl font-bold hover:bg-[#005B8D]  mt-12 mb-12"
        >
          {t("submitVoteButton")}
        </button>
      </main>

      {/* Speaker Toggle Button */}
      <div
  onClick={toggleSpeaker}
  className="fixed bottom-20 right-14 cursor-pointer"
  title={isSpeakerEnabled ? "Disable Audio" : "Enable Audio"}
>
  <img
    src={isSpeakerEnabled ? "/assets/images/volume.png" : "/assets/images/mute.png"}
    alt={isSpeakerEnabled ? "Speaker On" : "Speaker Off"}
    className="w-20 h-20"
  />
</div>

    </div>
  );
};

// Preload translations for the page
export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});


export default CandidateSelection;