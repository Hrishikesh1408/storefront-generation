import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";

function page() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-20 flex items-center px-20">
        <Image src={logo} alt="Turbify Logo" className="w-32 h-auto" priority />
      </header>
    </div>
  );
}

export default page;
