import React from 'react';
import { useGame } from './store/useGameStore.js';
import TitleScreen from './components/TitleScreen.jsx';
import Setup from './components/Setup.jsx';
import PlayScreen from './components/PlayScreen.jsx';
import Debrief from './components/Debrief.jsx';
import ReportModal from './components/ReportModal.jsx';
import StoryletModal from './components/StoryletModal.jsx';
import { SourcesOverlay, SettingsOverlay, HelpOverlay } from './components/Overlays.jsx';

export default function App() {
  const g = useGame();
  const cls = [g.settings.readable && 'readable', g.settings.colorblind && 'cb', g.settings.reduceMotion && 'calm'].filter(Boolean).join(' ');
  const inPlay = g.screen === 'play' && g.game && !g.game.outcome;

  return (
    <div className={`font-body min-h-screen bg-navy text-cream ${cls}`}>
      {g.screen === 'title' && (
        <TitleScreen mode={g.mode} setMode={g.setMode} hasGame={!!g.game && !g.game.outcome}
          onNew={g.goSetup} onContinue={() => useGame.setState({ screen: 'play' })} setOverlay={g.setOverlay} />
      )}
      {g.screen === 'setup' && <Setup mode={g.mode} onLaunch={g.launch} onBack={g.goTitle} />}
      {g.screen === 'play' && g.game && (
        <PlayScreen game={g.game} mode={g.game.mode} setTask={g.setTask} setPlan={g.setPlan} endSol={g.endSol}
          setOverlay={g.setOverlay} onMenu={g.goTitle} />
      )}
      {g.screen === 'debrief' && g.game?.outcome && (
        <Debrief game={g.game} onAgain={g.goSetup} onMenu={g.abandon} setOverlay={g.setOverlay} />
      )}

      {g.report && g.game && <ReportModal report={g.report} game={g.game} mode={g.game.mode} onClose={g.closeReport} />}
      {inPlay && !g.report && g.storylet && <StoryletModal storylet={g.storylet} game={g.game} onChoose={g.choose} />}

      {g.overlay === 'sources' && <SourcesOverlay onClose={() => g.setOverlay(null)} />}
      {g.overlay === 'settings' && <SettingsOverlay settings={g.settings} toggle={g.toggleSetting} onClose={() => g.setOverlay(null)} />}
      {g.overlay === 'help' && <HelpOverlay onClose={() => g.setOverlay(null)} />}
    </div>
  );
}
