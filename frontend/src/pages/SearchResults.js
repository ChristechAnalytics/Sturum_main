import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");

  const { user } = useAuthContext();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || !user?.token) return;

      try {
        const response = await fetch(
          `${API_URL}/api/search?query=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Search Results for "{query}"
        </h1>
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result._id}
                className="mb-5 p-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all"
              >
                {result.type === "user" ? (
                  <Link to={`/profile/${result._id}`}>
                    <div className="flex items-center">
                      {result.profileImage && (
                        <img
                          src={`${API_URL}${result.profileImage}`}
                          alt={result.title}
                          className="rounded-full mr-4 border-2 border-primary-200"
                          style={{ width: "50px", height: "50px" }}
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-primary-700">{result.title}</h2>
                        <p className="text-neutral-600">{result.description}</p>
                        <span className="text-sm text-neutral-500">
                          {result.email}
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : result.type === "post" ? (
                  <Link to="/home">
                    <div>
                      <div className="flex items-center mb-2">
                        {result.author?.profileImage && (
                          <img
                            src={`${API_URL}${result.author.profileImage}`}
                            alt={result.author.name}
                            className="rounded-full mr-2 border-2 border-neutral-200"
                            style={{ width: "30px", height: "30px" }}
                          />
                        )}
                        <span className="font-semibold text-primary-600">
                          {result.author?.name}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold mb-1 text-neutral-800">
                        Post
                      </h2>
                      <p className="text-neutral-600">{result.description}</p>
                    </div>
                  </Link>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-neutral-800">{result.title}</h2>
                    <p className="text-neutral-600 mb-2">{result.description}</p>
                    {result.fileUrl && (
                      <a
                        href={`${API_URL}${result.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                      >
                        Download Material
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">No results found for "{query}"</p>
            <p className="text-neutral-400 text-sm mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">Enter a search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
