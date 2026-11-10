import StartGameButton from "@/ui/start-game-button";

export default function PlayButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  return <StartGameButton disabled={disabled} />;
}
