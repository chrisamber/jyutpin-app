import { useState, useCallback } from "react";
import { searchSongs } from "../services/lyrics/index.js";

export function useLyricsFetch() {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setResults([]);
    try {
      const data = await searchSongs(query);
      if (data.length === 0) setSearchError("No results found.");
      setResults(data);
    } catch (err) {
      setSearchError("Search failed — check your connection.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchError(null);
  }, []);

  return { results, isSearching, searchError, search, clearResults };
}
