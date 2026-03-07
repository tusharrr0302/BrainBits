// src/components/pages/Codebattle.jsx
// Route: /Codebattle (already registered in App.jsx)
// Wraps the BattleProvider so battle state is scoped to this feature only.

import { BattleProvider, useBattle } from "../contexts/BattleContext";
import BattleLobby  from "../ui/battle/BattleLobby";
import BattleSetup  from "../ui/battle/BattleSetup";
import BattleArena  from "../ui/battle/BattleArena";
import BattleResult from "../ui/battle/BattleResult";

function BattleRouter() {
	const { state } = useBattle();

	switch (state.phase) {
		case "setup":
		case "countdown": return <BattleSetup />;
		case "battle":    return <BattleArena />;
		case "result":    return <BattleResult />;
		default:          return <BattleLobby />;
	}
}

export default function Codebattle() {
	return (
		<BattleProvider>
			<BattleRouter />
		</BattleProvider>
	);
}