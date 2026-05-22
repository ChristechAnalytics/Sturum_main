import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-30 bg-white dark:bg-neutral-900 shadow-sm">
      <div className="w-full max-w-full mx-auto">
        <div className="text-center py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 md:tracking-[0.3rem] font-semibold bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 border-b-2 border-primary-200 dark:border-neutral-700">
          <h1 className="text-xs sm:text-sm md:text-base lg:text-lg text-primary-700 dark:text-primary-400 font-bold truncate px-2">
            {user?.department || "Sturum"}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
