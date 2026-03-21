import { useLanguage } from "@/i18n/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "th" : "en")}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
      title={language === "en" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
    >
      {language === "en" ? (
        <>
          <span className="text-sm leading-none">🇹🇭</span>
          <span>TH</span>
        </>
      ) : (
        <>
          <span className="text-sm leading-none">🇬🇧</span>
          <span>EN</span>
        </>
      )}
    </button>
  );
};

export default LanguageSwitcher;
