"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();


  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center">
      <header className="p-4 flex items-center justify-between w-full max-w-5xl">
  <button onClick={() => router.push("/pages/Main")}>
    <Image
      src="/images/spotify-icon.png"
      alt="Spotify Logo"
      width={50}
      height={50}
      className="cursor-pointer"
    />
  </button>
  <nav className="flex items-center gap-8">
    <h1 className="text-white">Premium</h1>
    <h1 className="text-white">Support</h1>
    <h1 className="text-white">Download</h1>
    <div className="relative">
      <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-1 rounded-full">
        <Image
          src="/images/profile-icon.png"
          alt="Profile Icon"
          width={25}
          height={25}
          className="rounded-full"
        />
        Profile
      </button>
    </div>
  </nav>
</header>

      <div className="flex flex-1 flex-col p-5 items-center w-full max-w-5xl">
        <div className="flex flex-col items-center mb-8 w-full">
          <h2 className="text-3xl font-bold mb-2">Your plan</h2>
          <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg w-full">
            <p className="text-2xl font-bold">Spotify Free</p>
            <button
              className="ml-auto bg-gray-700 text-white px-4 py-2 rounded-full"
            >
              Explore plans
            </button>
          </div>
          <button
            className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full mt-4"
          >
            Join Premium
          </button>
        </div>
        <div className="flex flex-col items-center w-full">
          <h2 className="text-3xl font-bold mb-2">Account</h2>
          <div className="flex flex-col bg-gray-800 p-4 rounded-lg w-full">
            <button
              className="flex items-center gap-4 p-4 border-b border-gray-700 w-full text-left"
            >
              <Image
                src="/images/spotify-icon.png"
                alt="Manage Subscription Icon"
                width={25}
                height={25}
              />
              Manage your subscription
            </button>
            <button
          className="flex items-center gap-4 p-4 border-b border-gray-700 w-full text-left"
        onClick={() => router.push("/pages/editprofile")}
      >
     <Image
    src="/images/edit-profile-icon.png"
    alt="Edit Profile Icon"
    width={25}
    height={25}
  />
  Edit profile
</button>
            <button
              className="flex items-center gap-4 p-4 border-b border-gray-700 w-full text-left"
            >
              <Image
                src="/images/recover-playlists-icon.png"
                alt="Recover Playlists Icon"
                width={25}
                height={25}
              />
              Recover playlists
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}