const Footer = () => {
  return (
    <footer>
      {/* Links and copyright */}
      <div className="bg-background border-t border-border py-6 text-center">
        <div className="flex justify-center gap-4 mb-3">
          <a href="/privacy-policy" className="text-primary hover:underline text-sm">Privacy Policy</a>
          <a href="/terms" className="text-primary hover:underline text-sm">Terms & Conditions</a>
        </div>
        <p className="text-muted-foreground text-sm">©️ 2026 Lucky-Matka All Rights Reserved</p>
      </div>

      {/* Disclaimer bar */}
      <div className="bg-gradient-to-b from-yellow-dark to-primary py-4 px-6 text-center">
        <p className="text-primary-foreground text-xs font-bold leading-relaxed max-w-4xl mx-auto">
          !! DISCLAIMER - Lucky-Matka is a non-commercial informational website. Please view this site at your own risk, All The Information Shown On Website Is Sponsored And We Warn You That satta matka Gambling/Satta May Be Banned Or Illegal In Your Country. We Are Not Responsible For Any Issues Or Scam..., We Respect All Country Rules/Laws... If You Not Agree With Our Site disclaimer Please Quit Our Site Right Now. Thank You.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
