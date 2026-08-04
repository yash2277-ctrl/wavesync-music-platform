import { createContext, useContext, useState, ReactNode } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  albumArt?: string;
  path?: string;
}

interface QueueContextType {
  queue: Track[];
  currentIndex: number;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  playNext: (track: Track) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setQueue: (tracks: Track[], index?: number) => void;
  moveToIndex: (index: number) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToQueue = (track: Track) => {
    setQueueState(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueueState(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const playNext = (track: Track) => {
    setQueueState(prev => {
      const newQueue = [...prev];
      newQueue.splice(currentIndex + 1, 0, track);
      return newQueue;
    });
  };

  const clearQueue = () => {
    setQueueState([]);
    setCurrentIndex(0);
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    setQueueState(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const setQueue = (tracks: Track[], index: number = 0) => {
    setQueueState(tracks);
    setCurrentIndex(index);
  };

  const moveToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        currentIndex,
        addToQueue,
        removeFromQueue,
        playNext,
        clearQueue,
        reorderQueue,
        setQueue,
        moveToIndex,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within QueueProvider");
  }
  return context;
}
