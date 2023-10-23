'use client'

import { useState, useEffect } from 'react';
import io from "socket.io-client";

const socket = io();

export default function Home() {
  const [players, setPlayers] = useState<PlayerType[]>([]);  // <-- Notez le type ici

useEffect(() => {
    fetch('/api/points')
      .then(response => response.json())
      .then(data => setPlayers(data));

    socket.on('connect', () => {
      console.log('Successfully connected to socket server');
    });

    // when receiving update from server, update players 
    socket.on('update', () => {
      console.log('Received update event');
      fetch('/api/points')
        .then(response => response.json())
        .then(data => setPlayers(data));
    }
    );

    // Nettoyage lorsque le composant est démonté
    return () => {
      socket.off('update');
    };

}, []);


  const handleButtonClick = async (playerId: number, action: string) => {
    const response = await fetch('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, action }),
    });

    const updatedPlayer: PlayerType = await response.json();  // <-- Notez le type ici
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === playerId ? updatedPlayer : player
      )
    );

    const updateAllPlayers = await fetch('/api/points');
    const updatedPlayers: PlayerType[] = await updateAllPlayers.json();  // <-- Notez le type ici
    setPlayers(updatedPlayers);

    console.log('Emitting needUpdate event');
    socket.emit('needUpdate');
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-8 text-4xl font-bold">
        Capture! Le jeu !
      </div>
      <div className="flex w-3/4 justify-around">
        {players.map(player => (
          <div key={player.id} className="flex flex-col items-center bg-gray-200 p-8 w-1/3 h-96 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold">{player.name}</h2>
            <div className="text-4xl mt-4">{player.points}</div>
            <div className="flex mt-4">
              <button onClick={() => handleButtonClick(player.id, 'subtract')} className="bg-red-500 text-white p-3 rounded-l-md">-</button>
              <button onClick={() => handleButtonClick(player.id, 'add')} className="bg-green-500 text-white p-3 rounded-r-md">+</button>
            </div>
            <button onClick={() => handleButtonClick(player.id, 'reset')} className="bg-blue-500 text-white p-3 mt-4 rounded-md">Reset</button>
          </div>
        ))}
      </div>
    </div>
  )
}
