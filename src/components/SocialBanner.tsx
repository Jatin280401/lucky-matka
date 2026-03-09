
import WhatsAppIcon from "./WhatsAppIcon";
import TelegramIcon from "./TelegramIcon";

interface SocialBannerProps {
  type: "whatsapp" | "telegram";
  url: string;
}

const SocialBanner = ({ type, url }: SocialBannerProps) => {
  const isWhatsApp = type === "whatsapp";
  const bgColor = isWhatsApp ? "bg-[#25D366]" : "bg-[#24A1DE]";
  const title = isWhatsApp ? "WhatsApp" : "Telegram";
  const subtitle = isWhatsApp ? "Click to chat" : "Click to connect";
  const message = isWhatsApp
    ? '"NOW WHATSAPP PLAYERS CAN ALSO JOIN OUR WHATSAPP CHANNEL TO GET RESULTS QUICKLY AND RECEIVE SUPERFAST RESULTS."'
    : '"NOW TELEGRAM PLAYERS CAN ALSO JOIN OUR TELEGRAM CHANNEL TO GET RESULTS QUICKLY AND RECEIVE SUPERFAST RESULTS."';

  return (
    <div className="w-full bg-primary py-6 px-4 flex flex-col items-center justify-center border-y-[1.5px] border-dashed border-[#e91e63] my-1">
      <p className="text-black font-extrabold text-center text-[10px] md:text-sm mb-4 max-w-4xl tracking-tight leading-relaxed px-4">
        {message}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${bgColor} flex items-center gap-3 pl-1 pr-6 py-1 rounded-full shadow-md hover:opacity-90 transition-opacity active:scale-95 w-fit min-w-[200px]`}
      >
        <div className="bg-white rounded-full flex items-center justify-center w-10 h-10 shadow-sm overflow-hidden">
          {isWhatsApp ? (
            <WhatsAppIcon className="text-[#25D366] mt-0.5 ml-0.5" size={32} />
          ) : (
            <div className="p-2">
               <TelegramIcon className="text-[#24A1DE]" size={24} />
            </div>
          )}
        </div>
        <div className="flex flex-col text-white text-left leading-[1.1]">
          <span className="font-bold text-lg leading-none">{title}</span>
          <span className="text-[10px] font-bold leading-none">{subtitle}</span>
        </div>
      </a>
    </div>
  );
};

export default SocialBanner;
