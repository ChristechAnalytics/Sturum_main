import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-30 bg-white shadow-sm">
      <div className="w-full max-w-full mx-auto">
        <div className="text-center py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 md:tracking-[0.3rem] font-semibold bg-gradient-to-r from-primary-50 via-white to-primary-50 border-b-2 border-primary-200">
          <h1 className="text-xs sm:text-sm md:text-base lg:text-lg text-primary-700 font-bold truncate px-2">
            {user?.department || "Sturum"}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
