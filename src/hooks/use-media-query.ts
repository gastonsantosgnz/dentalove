"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)
    
    // Create event listener
    const listener = () => {
      setMatches(media.matches)
    }
    
    // Add the listener to media query
    media.addEventListener("change", listener)
    
    // Clean up function
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
} 