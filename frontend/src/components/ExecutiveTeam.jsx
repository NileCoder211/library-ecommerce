import { motion } from "framer-motion";

const executives = [
  {
    name: "Boniface Mwangi",
    role: "Chief Executive Officer",
    bio: "Boniface leads the organization with a strong vision in innovation and growth.",
    image: "/image2.jpg",
    twitter: "#",
    linkedin: "#",
    facebook: "#",
    tiktok: "#",
    instagram: "#",
  },
  {
    name: "Jane Smith",
    role: "Chief Technology Officer",
    bio: "Jane oversees all technical operations and drives digital transformation.",
    image: "https://i.pravatar.cc/150?img=2",
    twitter: "#",
    linkedin: "#",
    facebook: "#",
    tiktok: "#",
    instagram: "#",
  },
  {
    name: "Alex Johnson",
    role: "Chief Operations Officer",
    bio: "Alex ensures smooth operations and efficiency across all departments.",
    image: "https://i.pravatar.cc/150?img=3",
    twitter: "#",
    linkedin: "#",
    facebook: "#",
    tiktok: "#",
    instagram: "#",
  },
];

export default function ExecutiveSection() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-extrabold text-emerald-400">
            Meet Our Executives
          </h2>
          <p className="mt-4 text-gray-400">
            Leadership team driving vision, strategy, and success.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {executives.map((exec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 transition"
            >
              <div className="flex flex-col items-center text-center">
                {/* Image */}
                <img
                  src={exec.image}
                  alt={exec.name}
                  className="w-32 h-32 rounded-full mb-4 border-2 border-emerald-400 object-cover"
                />

                {/* Name */}
                <h3 className="text-xl font-semibold text-white">
                  {exec.name}
                </h3>

                {/* Role */}
                <p className="text-emerald-400 text-sm">{exec.role}</p>

                {/* Bio */}
                <p className="mt-3 text-gray-400 text-sm">{exec.bio}</p>

                {/* Social Links */}
                <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
                  <a
                    href={exec.twitter}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    Twitter
                  </a>
                  <a
                    href={exec.linkedin}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={exec.facebook}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    Facebook
                  </a>
                  <a
                    href={exec.tiktok}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    TikTok
                  </a>
                  <a
                    href={exec.instagram}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
