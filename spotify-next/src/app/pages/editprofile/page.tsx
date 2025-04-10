"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function EditProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState({ day: "11", month: "January", year: "2000" });
  const [country, setCountry] = useState("Georgia");
  const [marketing, setMarketing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("email") || "");
      setPassword(localStorage.getItem("password") || "");
      setGender(localStorage.getItem("gender") || "Male");
      setDob({
        day: localStorage.getItem("dob_day") || "11",
        month: localStorage.getItem("dob_month") || "January",
        year: localStorage.getItem("dob_year") || "2000",
      });
      setCountry(localStorage.getItem("country") || "Georgia");
      setMarketing(localStorage.getItem("marketing") === "true");
      setAvatar(localStorage.getItem("avatar"));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const profileData = {
      email,
      password,
      gender,
      dob,
      country,
      marketing,
      avatar,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("gender", gender);
      localStorage.setItem("dob_day", dob.day);
      localStorage.setItem("dob_month", dob.month);
      localStorage.setItem("dob_year", dob.year);
      localStorage.setItem("country", country);
      localStorage.setItem("marketing", marketing.toString());
      if (avatar) {
        localStorage.setItem("avatar", avatar);
      }
    }

    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Server error");

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile on server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/pages/account");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarReset = () => {
    setAvatar(null);
    localStorage.removeItem("avatar");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          className="text-white text-2xl"
          onClick={() => router.push("/pages/account")}
        >
          &larr;
        </button>
        <h1 className="text-3xl font-bold">Edit profile</h1>
      </header>

      <form
        className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <div
          className={`mb-6 flex items-center gap-6 border-2 p-2 rounded-lg ${
            isDragging ? "border-green-500 bg-gray-700" : "border-gray-600"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onloadend = () => setAvatar(reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-500"
              width={96}
              height={96}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-sm text-gray-300">
              Drop Image
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
            {avatar && (
              <button
                type="button"
                onClick={handleAvatarReset}
                className="text-red-400 text-xs hover:underline"
              >
                Remove Avatar
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Username</label>
          <p className="bg-gray-700 text-white p-2 rounded">
            {Math.random().toString(36).substring(2, 18)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            className="w-full bg-gray-700 text-white p-2 rounded"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Gender</label>
          <select
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Date of birth</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/3 bg-gray-700 text-white p-2 rounded"
              placeholder="Day"
              value={dob.day}
              onChange={(e) => setDob({ ...dob, day: e.target.value })}
            />
            <select
              className="w-1/3 bg-gray-700 text-white p-2 rounded"
              value={dob.month}
              onChange={(e) => setDob({ ...dob, month: e.target.value })}
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-1/3 bg-gray-700 text-white p-2 rounded"
              placeholder="Year"
              value={dob.year}
              onChange={(e) => setDob({ ...dob, year: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Country or region
          </label>
          <select
            className="w-full bg-gray-700 text-white p-2 rounded"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option>Georgia</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Germany</option>
            <option>France</option>
            <option>Japan</option>
            <option>India</option>
            <option>China</option>
            <option>Brazil</option>
            <option>Australia</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </main>
  );
}
