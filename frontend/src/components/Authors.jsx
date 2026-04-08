import { motion } from "framer-motion";

const authors = [
  {
    name: "Boniface Mwangi",
    role: "Senior Writer",
    bio: "Boniface specializes in technology and startups with over 10 years of experience.",
    image: "/image2.jpg",
    twitter: "#",
    linkedin: "#",
    Facebook: "#",
    TikToK: "#",
    Instagram: "#",
  },
  {
    name: "Jane Smith",
    role: "Editor",
    bio: "Jane ensures all content meets high editorial standards and clarity.",
    image: "https://i.pravatar.cc/150?img=2",
    twitter: "#",
    linkedin: "#",
    Facebook: "#",
    TikToK: "#",
    Instagram: "#",
  },
  {
    name: "Alex Johnson",
    role: "Content Creator",
    bio: "Alex creates engaging articles focused on design and user experience.",
    image: "https://i.pravatar.cc/150?img=3",
    twitter: "#",
    linkedin: "#",
    Facebook: "#",
    TikToK: "#",
    Instagram: "#",
  },
];

export default function Authors() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-extrabold text-emerald-400">
            Meet Our Authors
          </h2>
          <p className="mt-4 text-gray-400">
            A team of passionate writers bringing you quality content.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 transition"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-34 h-34 rounded-full mb-4 border-2 border-emerald-400"
                />
                <h3 className="text-xl font-semibold text-white">
                  {author.name}
                </h3>
                <p className="text-emerald-400 text-sm">{author.role}</p>
                <p className="mt-3 text-gray-400 text-sm">{author.bio}</p>

                <div className="flex space-x-4 mt-4">
                  <a
                    href={author.twitter}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    Twitter
                  </a>
                  <a
                    href={author.linkedin}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={author.linkedin}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    Facebook
                  </a>
                  <a
                    href={author.linkedin}
                    className="text-gray-400 hover:text-emerald-400"
                  >
                    Tiktok
                  </a>
                  <a
                    href={author.linkedin}
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
