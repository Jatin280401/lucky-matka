import Navbar from "@/components/Navbar";
import MarqueeBar from "@/components/MarqueeBar";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const WHATSAPP_NUMBERS = [
  { number: "+919991968836", label: "+91 9991968836" },
  { number: "+919991779501", label: "+91 9991779501" },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarqueeBar />

      {/* LUCKY-MATKA Title Bar */}
      <div className="bg-primary py-3">
        <h1 className="text-primary-foreground text-4xl font-bold tracking-wider opacity-60 text-center">
          LUCKY-MATKA
        </h1>
      </div>

      {/* Contact message */}
      <div className="bg-background py-16 px-4 text-center max-w-4xl mx-auto">
        <h2 className="text-primary text-3xl font-extrabold mb-4">
          Contact For Information
        </h2>
        <p className="text-muted-foreground mb-12 text-lg">
          Get in touch with us directly via WhatsApp for any queries or information.
        </p>

        {/* WhatsApp contact links */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {WHATSAPP_NUMBERS.map((item) => (
            <a
              key={item.number}
              href={`https://wa.me/${item.number.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-[#128c7e] transition-all shadow-xl hover:shadow-[#25D366]/20 hover:-translate-y-1 w-full sm:w-auto"
            >
              <WhatsAppIcon size={32} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
