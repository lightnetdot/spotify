import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

const samplePlaylists = [
  { id: 1, name: "Любимые треки", image: "/heart.png", icon: true },
  { id: 2, name: "jennifer's body", image: "/albums/jennifer.jpg" },
  { id: 3, name: "GOD SYSTEM", image: "/albums/god.jpg" },
  { id: 4, name: "деньги", image: "/albums/money.jpg" },
  { id: 5, name: "101 ПРИЧИНА", image: "/albums/101.jpg" },
  { id: 6, name: "Мой плейлист №1", image: "/albums/custom1.jpg" },
  { id: 7, name: "9mice", image: "/albums/9mice.jpg" },
  { id: 8, name: "Kai Angel", image: "/albums/kai.jpg" },
];

const PlaylistGrid = () => {
  const [filter, setFilter] = useState("all");

  const filters = ["Все", "Музыка", "Подкасты"];

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="flex gap-3 mb-6">
        {filters.map((f, i) => (
          <button
            key={i}
            onClick={() => setFilter(f.toLowerCase())}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filter === f.toLowerCase()
                ? "bg-white text-black"
                : "bg-[#2a2646] text-white hover:bg-[#3a3266]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl px-4">
        {samplePlaylists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex items-center gap-4 bg-[#2b2b2b] hover:bg-[#383838] transition p-3 rounded-xl cursor-pointer"
          >
            {playlist.icon ? (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-md">
                <Heart className="text-white" />
              </div>
            ) : (
              <Image
                src={playlist.image}
                alt={playlist.name}
                width={60}
                height={60}
                className="rounded"
              />
            )}
            <h3 className="text-white text-base font-semibold">
              {playlist.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistGrid;
