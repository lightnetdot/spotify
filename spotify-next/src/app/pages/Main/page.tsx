"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  description: string;
  audio: string;
}

interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

function getRandomColor() {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FF8333"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function SpotifyMainPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isTrackInfoVisible, setIsTrackInfoVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const [profileInitial, setProfileInitial] = useState("");
  const [profileColor, setProfileColor] = useState("");

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => {
        if (!isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", updateDuration);
      audio.addEventListener("durationchange", updateDuration);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("durationchange", updateDuration);
      };
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("tracks", JSON.stringify(filteredTracks));
  }, [filteredTracks]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrack, setNewTrack] = useState<{
    title: string;
    artist: string;
    cover: File | null;
    audio: File | null;
  }>({
    title: "",
    artist: "",
    cover: null,
    audio: null,
  });

  const handleSubmitNewTrack = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const addedTrack = {
      id: Date.now(),
      title: newTrack.title,
      artist: newTrack.artist,
      cover: newTrack.cover ? URL.createObjectURL(newTrack.cover) : "",
      audio: newTrack.audio ? URL.createObjectURL(newTrack.audio) : "",
      description: "User uploaded",
    };

    setFilteredTracks((prev) => [...prev, addedTrack]);
    setShowAddModal(false);
    setNewTrack({ title: "", artist: "", cover: null, audio: null });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Math.min(parseFloat(e.target.value), duration);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    fetch("/data/tracks.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched tracks:", data);
        setTracks(data);
        setFilteredTracks(data);
      })
      .catch((error) => {
        console.error("Error fetching tracks:", error);
        setError("Failed to load tracks. Try again later.");
      });
  }, []);

  useEffect(() => {
    const savedTracks = localStorage.getItem("tracks");
    if (savedTracks) {
      setFilteredTracks(JSON.parse(savedTracks));
    }
  }, []);

  useEffect(() => {
    const savedRecentTracks = localStorage.getItem("recentTracks");
    if (savedRecentTracks) {
      const parsedTracks = JSON.parse(savedRecentTracks);
      setRecentTracks(parsedTracks.slice(0, 5));
    }

    const email = localStorage.getItem("email");
    if (email) {
      setProfileInitial(email.charAt(0).toUpperCase());
      setProfileColor(getRandomColor());
    }

    const savedFavoriteTracks = localStorage.getItem("favoriteTracks");
    if (savedFavoriteTracks) {
      setFavoriteTracks(JSON.parse(savedFavoriteTracks));
    }

    const savedPlaylists = localStorage.getItem("playlists");
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  useEffect(() => {
    if (selectedTrack && audioRef.current) {
      audioRef.current.src = selectedTrack.audio;
      audioRef.current.play();
      setIsPlaying(true);
      addRecentTrack(selectedTrack);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (activeTab === "all") {
      if (searchQuery === "") {
        setFilteredTracks(tracks);
      } else {
        const results = tracks.filter(
          (track) =>
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.title.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
        setFilteredTracks(results);
      }
    }
  }, [searchQuery, tracks, activeTab]);

  useEffect(() => {
    if (activeTab === "favorites") {
      setFilteredTracks(favoriteTracks);
    } else if (activeTab === "playlists") {
      setFilteredTracks([]);
    } else if (activeTab === "all") {
      setFilteredTracks(tracks);
    }
  }, [activeTab, favoriteTracks, playlists, tracks]);

  const addRecentTrack = (track: Track) => {
    setRecentTracks((prevTracks) => {
      const updatedTracks = [
        track,
        ...prevTracks.filter((t) => t.id !== track.id),
      ].slice(0, 5);
      localStorage.setItem("recentTracks", JSON.stringify(updatedTracks));
      return updatedTracks;
    });
  };

  const handleLogout = () => {
    localStorage.setItem("loggedIn", "false");
    router.push("/pages/Login");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (activeTab !== "all") {
      setActiveTab("all");
    }
  };

  const handleNextTrack = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTrackIndex(
        (prevIndex) => (prevIndex + 1) % filteredTracks.length
      );
      setIsAnimating(false);
    }, 500);
  };

  const handlePreviousTrack = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTrackIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredTracks.length) % filteredTracks.length
      );
      setIsAnimating(false);
    }, 500);
  };

  const toggleFavorite = (track: Track) => {
    setFavoriteTracks((prevFavorites) => {
      const isAlreadyFavorite = prevFavorites.some((t) => t.id === track.id);
      let updatedFavorites: Track[];

      if (isAlreadyFavorite) {
        updatedFavorites = prevFavorites.filter((t) => t.id !== track.id);
      } else {
        updatedFavorites = [...prevFavorites, { ...track }];
      }
      localStorage.setItem("favoriteTracks", JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  useEffect(() => {
    localStorage.setItem("favoriteTracks", JSON.stringify(favoriteTracks));
  }, [favoriteTracks]);

  const handleTrackClick = (track: Track) => {
    setSelectedTrack(track);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    setFilteredTracks(playlist.tracks);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  return (
    <>
      <main
        className="min-h-screen text-white flex flex-col rounded-x1"
        style={{ background: "linear-gradient(to bottom, #31285c, #000000)" }}
      >
        <header className="bg-black p-2 flex items-center justify-between relative">
          <div className="flex items-center gap-8">
            <Image
              src="/images/spotify-icon.png"
              alt="Spotify Icon"
              width={33}
              height={33}
              className="relative left-[10px]"
            />
            <Image
              src="/images/home-icon.png"
              alt="Home Icon"
              width={50}
              height={50}
            />
            <form
              className="flex items-center gap-2 bg-gray-800 rounded-full px-6 py-2"
              style={{ width: "440px", height: "40px" }}
            >
              <label htmlFor="song-search" className="cursor-pointer">
                <Image
                  src="/images/search-icon.png"
                  alt="Search Icon"
                  width={40}
                  height={40}
                  className="ml-[-14]"
                />
              </label>
              <input
                id="song-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="What do you want to listen?"
                className="bg-transparent focus:outline-none text-white placeholder-gray-400 ml-[-14]"
              />
            </form>
          </div>
          <div className="flex items-center gap-4 relative">
            <button className="text-white p-2 rounded-full">
              <Image
                src="/images/bell-icon.png"
                alt="Notifications Icon"
                width={25}
                height={25}
              />
            </button>
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 bg-gray-800 text-white px-2 py-1 rounded-full"
              >
                <div
                  style={{ backgroundColor: profileColor }}
                  className="flex items-center justify-center rounded-full w-6 h-6"
                >
                  {profileInitial}
                </div>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-[5px] shadow-lg z-10">
                  <ul className="flex flex-col p-2">
                    <li
                      onClick={() => router.push("/pages/account")}
                      className="hover:bg-gray-700 p-2 rounded cursor-pointer"
                    >
                      Account
                    </li>
                    <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                      Profile
                    </li>
                    <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                      Upgrade to Premium
                    </li>
                    <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                      Reference
                    </li>
                    <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                      Download
                    </li>
                    <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
                      Settings
                    </li>
                    <li
                      className="hover:bg-gray-700 p-2 rounded cursor-pointer"
                      onClick={handleLogout}
                    >
                      Log out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="bg-black p-5 w-80 flex flex-col">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">My Library</h3>
                <ul className="mt-2 space-y-2">
                  <li
                    className="hover:text-green-500 cursor-pointer"
                    onClick={() => setActiveTab("all")}
                  >
                    All Tracks
                  </li>
                  <li
                    className="hover:text-green-500 cursor-pointer"
                    onClick={() => setActiveTab("favorites")}
                  >
                    Favorite Tracks
                  </li>
                  <li
                    className="hover:text-green-500 cursor-pointer"
                    onClick={() => setActiveTab("playlists")}
                  >
                    Playlists
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold">Recently Listened</h3>
                <ul className="mt-2 space-y-2">
                  {recentTracks.map((track) => (
                    <li
                      key={track.id}
                      className="hover:text-green-500 cursor-pointer flex items-center gap-2"
                      onClick={() => handleTrackClick(track)}
                    >
                      <Image
                        src={track.cover}
                        alt={`${track.title} cover`}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <div className="mt-4 text-center">
                        <p className="font-bold">{track.title}</p>
                        <p className="text-sm text-gray-400">{track.artist}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4 relative left-[18px]">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "all" ? "bg-gray-700" : "bg-gray-800"
                  } text-white rounded-full`}
                  onClick={() => setActiveTab("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "music" ? "bg-gray-700" : "bg-gray-800"
                  } text-white rounded-full`}
                  onClick={() => setActiveTab("music")}
                >
                  Music
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "podcasts" ? "bg-gray-700" : "bg-gray-800"
                  } text-white rounded-full`}
                  onClick={() => setActiveTab("podcasts")}
                >
                  Podcasts
                </button>
              </div>
              <div className="mb-4">
                <button
                  className={`flex items-center px-4 py-2 ${
                    activeTab === "favorites"
                      ? "bg-gradient-to-r from-[#4B14F0] to-[#8580E4]"
                      : "bg-[#343434] rounded-2xl"
                  } text-white rounded-md`}
                  onClick={() => setActiveTab("favorites")} // Здесь переключение на вкладку "favorites"
                  style={{
                    width: "380px",
                    height: "49px",
                    position: "relative",
                    left: "18px",
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#4B14F0] to-[#8580E4] rounded-md relative left-[-15px]">
                    <Image
                      src="/images/heart-icon.png"
                      alt="Like Icon"
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="ml-4 font-bold">Favorite Tracks</span>
                </button>
              </div>

              <div className="mb-4">
                <button
                  className={`flex items-center px-4 py-2 ${
                    activeTab === "addTrack"
                      ? "bg-gradient-to-r from-[#4B14F0] to-[#8580E4]"
                      : "bg-[#343434] rounded-2xl"
                  } text-white rounded-md`}
                  onClick={() => setShowAddModal(true)}
                  style={{
                    width: "380px",
                    height: "49px",
                    position: "relative",
                    left: "18px",
                  }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#025320] to-[#005820] rounded-md relative left-[-15px]">
                    <Image
                      src="/images/add-track.png"
                      alt="Add Track Icon"
                      width={35}
                      height={35}
                    />
                  </div>
                  <span className="ml-4 font-bold">Add Track!</span>
                </button>

                <div className="mt-4"></div>

                {showAddModal && (
                  <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                      <h2 className="text-white text-lg font-bold mb-4">
                        Add New Track
                      </h2>

                      <form onSubmit={handleSubmitNewTrack}>
                        <div className="mb-4">
                          <label
                            htmlFor="title"
                            className="block text-white mb-2"
                          >
                            Title
                          </label>
                          <input
                            id="title"
                            type="text"
                            value={newTrack.title}
                            onChange={(e) =>
                              setNewTrack({
                                ...newTrack,
                                title: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="artist"
                            className="block text-white mb-2"
                          >
                            Artist
                          </label>
                          <input
                            id="artist"
                            type="text"
                            value={newTrack.artist}
                            onChange={(e) =>
                              setNewTrack({
                                ...newTrack,
                                artist: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="cover"
                            className="block text-white mb-2"
                          >
                            Cover Image
                          </label>
                          <input
                            id="cover"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setNewTrack({
                                ...newTrack,
                                cover: e.target.files?.[0] || null,
                              })
                            }
                            className="w-full p-2 rounded bg-gray-700 text-white"
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="audio"
                            className="block text-white mb-2"
                          >
                            Audio File
                          </label>
                          <input
                            id="audio"
                            type="file"
                            accept="audio/*"
                            onChange={(e) =>
                              setNewTrack({
                                ...newTrack,
                                audio: e.target.files?.[0] || null,
                              })
                            }
                            className="w-full p-2 rounded bg-gray-700 text-white"
                          />
                        </div>
                        <div className="flex justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded"
                          >
                            Add Track
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between bg-gray-800 p-4 rounded cursor-pointer hover:bg-[#343434]"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <div className="flex items-center">
                      <Image
                        src={
                          playlist.tracks[0]?.cover ||
                          "/images/default-cover.png"
                        }
                        alt={playlist.name}
                        width={40}
                        height={40}
                        className="rounded mr-4"
                      />
                      <p className="text-white">{playlist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <section className="flex flex-col flex-1 overflow-hidden relative">
              {error ? (
                <p className="text-red-500 mb-8">{error}</p>
              ) : (
                <div className="w-full max-w-5xl mx-auto relative ml-[-97]">
                  <button
                    onClick={handlePreviousTrack}
                    className="absolute left-28 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full"
                  >
                    &lt;
                  </button>
                  <div className="w-full flex justify-center overflow-hidden">
                    <ul className="flex transition-transform duration-500 ease-in-out">
                      {filteredTracks
                        .slice(currentTrackIndex, currentTrackIndex + 5)
                        .map((track, index) => (
                          <li
                            key={`${track.id}-${index}`}
                            className={`flex-none w-48 p-2 transition-opacity duration-500 ease-in-out ${
                              isAnimating ? "opacity-0" : "opacity-100"
                            }`}
                            onClick={() => handleTrackClick(track)}
                          >
                            <Image
                              src={track.cover}
                              alt={`${track.title} Cover`}
                              width={150}
                              height={150}
                              className="rounded"
                            />
                            <div className="mt-4 text-center">
                              <p className="font-bold">{track.title}</p>
                              <p className="text-sm text-gray-400">
                                {track.artist}
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <button
                    onClick={handleNextTrack}
                    className="absolute right-34 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </section>
            {selectedTrack && (
              <aside
                className={`absolute right-0 top-16 w-64 bg-gray-950 p-5 h-full flex flex-col transition-transform duration-300 ${
                  isTrackInfoVisible ? "translate-x-0" : "translate-x-full"
                }`}
              >
                <h3 className="text-xl font-bold mb-4">Track information</h3>
                <Image
                  src={selectedTrack.cover}
                  alt={`${selectedTrack.title} Cover`}
                  width={250}
                  height={250}
                  layout="intrinsic"
                  className="rounded mb-4 mt-20"
                />
                <p className="font-bold">{selectedTrack.title}</p>
                <p className="text-sm text-gray-400">{selectedTrack.artist}</p>
                <p className="mt-4">{selectedTrack.description}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(selectedTrack);
                  }}
                  className="mt-2 transition-transform hover:scale-110"
                >
                  <Image
                    src={
                      favoriteTracks.some((t) => t.id === selectedTrack.id)
                        ? "/images/liked-icon.png"
                        : "/images/like-icon.png"
                    }
                    alt="Like"
                    width={24}
                    height={24}
                  />
                </button>
              </aside>
            )}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-black p-4 flex flex-col z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Image
                src={selectedTrack?.cover || "/images/default-cover.png"}
                alt={`${selectedTrack?.title || "default"} cover`}
                width={56}
                height={56}
                className="rounded"
              />
              <div className="flex flex-col">
                <p className="font-bold text-sm">
                  {selectedTrack?.title || "No track selected"}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedTrack?.artist || ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center p-2 rounded-full bg-transparent">
                <Image
                  src="/images/shuffle-icon.png"
                  alt="Shuffle"
                  width={26}
                  height={26}
                />
              </button>
              <button
                onClick={handlePreviousTrack}
                className="w-10 h-10 flex items-center justify-center p-2 rounded-full bg-transparent"
              >
                <Image
                  src="/images/previous-icon.png"
                  alt="Previous"
                  width={26}
                  height={26}
                />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 flex items-center justify-center p-2 rounded-full bg-transparent"
              >
                {isPlaying ? (
                  <Image
                    src="/images/pause-icon.png"
                    alt="Pause"
                    width={40}
                    height={40}
                  />
                ) : (
                  <Image
                    src="/images/play-icon.png"
                    alt="Play"
                    width={40}
                    height={40}
                  />
                )}
              </button>
              <button
                onClick={handleNextTrack}
                className="w-10 h-10 flex items-center justify-center p-2 rounded-full bg-transparent"
              >
                <Image
                  src="/images/next-icon.png"
                  alt="Next"
                  width={26}
                  height={26}
                />
              </button>
              <button className="w-10 h-10 flex items-center justify-center p-2 rounded-full bg-transparent">
                <Image
                  src="/images/repeat-icon.png"
                  alt="Repeat"
                  width={26}
                  height={26}
                />
              </button>
            </div>

            <div className="flex items-center">
              <button
                className="text-white p-2 rounded-full"
                onClick={() => setIsTrackInfoVisible(!isTrackInfoVisible)}
              >
                <Image
                  src="/images/device-icon.png"
                  alt="Track Info Toggle"
                  width={19}
                  height={19}
                />
              </button>
              <button className="text-white flex items-center justify-center mr-2">
                <Image
                  src="/images/volume-icon.png"
                  alt="Volume"
                  width={20}
                  height={20}
                />
              </button>
              <div className="relative w-16 h-2 flex items-center mr-4">
                <div className="absolute w-full h-1 bg-gray-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  className="w-full h-1 bg-gray-400 rounded-full cursor-pointer"
                  onChange={handleVolumeChange}
                />
              </div>
              <button className="text-white mx-2">
                <Image
                  src="/images/mini-player.png"
                  alt="Mini Player"
                  width={20}
                  height={20}
                />
              </button>
              <button className="text-white mx-2">
                <Image
                  src="/images/fullscreen-icon.png"
                  alt="Fullscreen"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-[650px] ml-101">
            <span className="text-white text-xs">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              className="flex-1 slider"
              onChange={handleSeek}
            />
            <span className="text-white text-xs">{formatTime(duration)}</span>
          </div>

          <audio ref={audioRef} />
        </div>
        <div className="flex items-center pl-65">
          <button className="text-white p-2 rounded-full">
            <Image
              src="/images/volume-icon.png"
              alt="Volume"
              width={23}
              height={23}
            />
          </button>
          <button className="text-white p-2 rounded-full">
            <Image
              src="/images/mini-player.png"
              alt="Repeat"
              width={23}
              height={23}
            />
          </button>
          <button className="text-white p-2 rounded-full">
            <Image
              src="/images/fullscreen-icon.png"
              alt="Fullscreen"
              width={21}
              height={21}
            />
          </button>
        </div>
        <audio ref={audioRef} />
      </main>
    </>
  );
}
