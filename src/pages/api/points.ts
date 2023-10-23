// pages/api/points.ts
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  switch (req.method) {
    case "GET":
      // Renvoyer les points actuels
      const players = await prisma.player.findMany({
        select: {
          id: true,
          name: true,
          points: true,
        },
      });
      res.status(200).json(players);
      break;
    case "POST":
      let { playerId, action } = req.body;
      playerId = Number(playerId);

      if (playerId && action) {
        let updatedPlayer;

        if (action === "add") {
          updatedPlayer = await prisma.player.update({
            where: { id: playerId },
            data: { points: { increment: 1 } },
          });
        } else if (action === "subtract") {
          updatedPlayer = await prisma.player.update({
            where: { id: playerId },
            data: { points: { decrement: 1 } },
          });
        } else if (action === "reset") {
          updatedPlayer = await prisma.player.update({
            where: { id: playerId },
            data: { points: 0 },
          });
        }
        res.status(200).json(updatedPlayer);
      } else {
        res
          .status(400)
          .send("Request body must contain 'playerId' and 'action'.");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
