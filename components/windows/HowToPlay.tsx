import { howToPlay } from "@/data/howToPlay";

// docs/GAME_DESIGN.md > How to Play window (exact text)
export default function HowToPlay() {
  return (
    <ol className="list-decimal space-y-2 pl-8 text-[18px] leading-normal">
      {howToPlay.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ol>
  );
}
