'use client';

import Image from "next/image";
import { useState } from "react";
import logo from "@/src/assets/images/newturbifylogo.png";
import Input from "@/src/components/ui/TextInput/InputComponent";
import Button from "@/src/components/ui/Button/ButtonComponent";
import UserRoleModal from "@/src/components/admin/UserRoleModal";

export default function Page() {

    const [email, setEmail] = useState("");
    const [showTable, setShowTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const handleSearch = async () => {

        if (!email) return;

        setLoading(true);

        try {

            const res = await fetch(`/api/user?email=${encodeURIComponent(email)}`);

            if (!res.ok) {
                throw new Error("User not found");
            }

            const data = await res.json();

            setUserData(data);
            setShowTable(true);

        } catch (err) {
            console.error("Error fetching user data:", err);
            setUserData(null);
            setShowTable(false);
        } finally {
            setLoading(false);
        }

    };

    const openModal = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* Header */}
            <header className="h-20 flex items-center px-20">
                <Image
                src={logo}
                alt="Turbify Logo"
                className="w-32 h-auto"
                priority
                />
            </header>

            <main className="flex flex-col py-10 mx-15 px-5 bg-white">

                <div>

                    <div
                        id="EmailContainer"
                        className="flex gap-4 mb-6"
                    >

                        <Input
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Search user by email"
                            size="sm"
                            clearable
                            onClear={() => {
                                setEmail("");
                                setShowTable(false);
                                setUserData(null);
                            }}  
                        />

                        <Button onClick={handleSearch} type="submit" size="sm">
                            Search
                        </Button>

                    </div>

                </div>

                {showTable && userData && (
            
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-xs border border-gray-300">

                        {/* ================= UPPER SUMMARY ================= */}

                        <thead className="">

                            <tr className="bg-gray-200 font-semibold">

                                <th className="p-2 text-left">UID</th>
                                <th className="p-2 text-left">Email/YID</th>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Role</th>
                            </tr>
                        </thead>
                        <tbody className="">

                            <tr className="bg-gray-50 border-t">

                                <td className="p-2">
                                    {userData?.id || "N/A"}
                                </td>

                                <td className="p-2">
                                    {userData?.email || "N/A"}
                                </td>

                                <td className="p-2">
                                    {userData?.name || "N/A"}
                                </td>

                                <td className="p-2">
                                    <button onClick={() => openModal(userData)} className="text-blue-600 hover:text-blue-800">{userData?.role || "N/A"}</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>  
                </div> 
                )
                }

                <UserRoleModal
                    user={selectedUser}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />

            </main>

        </div>
    );
}