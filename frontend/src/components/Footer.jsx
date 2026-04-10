import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-emerald-400">
              LegacyScroll
            </h2>
            <p className="mt-4 text-sm">
              Discovering stories that inspire, educate, and ignite imagination.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="hover:text-emerald-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400">
                  About
                </Link>
              </li>
              <li>
                <Link to="/authors" className="hover:text-emerald-400">
                  Authors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/privacy" className="hover:text-emerald-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-emerald-400">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-emerald-400">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                Legacyscrollsinc.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                +254 723439603
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()} LegacyScroll. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-emerald-400">
              Twitter
            </a>
            <a href="#" className="hover:text-emerald-400">
              LinkedIn
            </a>
            <a href="#" className="hover:text-emerald-400">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
