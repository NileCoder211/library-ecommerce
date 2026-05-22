
import { FaFacebook,FaInstagram,FaTiktok,FaWhatsapp,} from "react-icons/fa";
import {ArrowUpRight} from "lucide-react";

const footerSections = [
  {
    title: "Collections",
    items: ["Sofa", "Beds", "Dining", "Stools", "Wardrobes", "Doors"],
  },
  {
    title: "Experience",
    items: ["About Us", "Materials", "Sustainability", "Trade Program"],
  },
  {
    title: "Support",
    items: [ "Track Order","Contact Us", "Shipping & Returns", "FAQ", "Privacy Policy"],
  },
];

const Footer = () => (
  <footer className="bg-[#efeeec] border-t border-gray-200">
    <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      {/* Brand */}
      <div>
        <h2 className="text-3xl text-black font-serif mb-6">Shamith Furniture</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Exquisite craftsmanship for contemporary architectural spaces.
          Defining luxury since 2010.
        </p>
       <div className="flex gap-4">
  {/* Facebook */}
  <a
  href="https://facebook.com/your-page"
  target="_blank"
  rel="noopener noreferrer"
  className="group h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors"
>
  <FaFacebook size={22} className="text-gray-700 group-hover:text-white transition-colors" />
</a>

  {/* TikTok */}
  <a
    href="https://tiktok.com/@your-account"
    target="_blank"
    rel="noopener noreferrer"
    className="group h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg-black hover:border-black transition-colors"
  >
    <FaTiktok size={20} className="text-gray-700 group-hover:text-white transition-colors" />
  </a>

  {/* Instagram */}
  <a
    href="https://instagram.com/your-account"
    target="_blank"
    rel="noopener noreferrer"
    className="group h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg- hover:bg-gradient-to-tr hover:from-[#FCAF45] hover:via-[#E1306C] hover:to-[#833AB4] hover:border-transparent hover:border-black transition-colors"
  >
    <FaInstagram size={22} className="text-gray-700 group-hover:text-white transition-colors" />
  </a>

  {/* WhatsApp */}
  <a
     href="https://wa.me/254700000000"
  target="_blank"
  rel="noopener noreferrer"
  className="group h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-colors"
>
  <FaWhatsapp size={22} className="text-gray-700 group-hover:text-white transition-colors" />
</a>
</div>
      </div>

      {/* Link Columns */}
      {footerSections.map((section) => (
        <div key={section.title}>
          <h4 className="uppercase tracking-widest text-black text-sm mb-8 font-semibold">
            {section.title}
          </h4>
          <ul className="space-y-4">
            {section.items.map((item) => (
              <li key={item}>
                 

                <a
                  href="#"
      className="group flex items-center justify-between gap-2 text-gray-600 hover:text-[#7c5730] transition-colors border-b border-gray-300 py-2"
    >
      {item}
                  <ArrowUpRight
        size={14}
        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x- transition-all duration-300"
      />
                 
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar */}
    <div className="border-t border-gray-300">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-6 flex flex-col md:flex-row justify-between items-center gap-5">
        <p className="text-sm text-gray-500">
          © 2026 Shamith Furniture. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs tracking-widest text-gray-500">
          {["MILAN", "PARIS", "NEW YORK", "LONDON"].map((city) => (
            <span key={city}>{city}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;