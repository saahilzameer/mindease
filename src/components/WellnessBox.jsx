import React, { useState, useEffect } from 'react';
import {
    MoodConstellation, BreathRipple, OneWordOrbit, ThoughtDrop, SafePlaceBuilder,
    EmotionSlider, UnfinishedSentence, BodyMapTouch, YesNotYet, NightSkyJournal
} from './box/Games';
import { BoxBreathing, Grounding, PatternMatch, BalloonPop, Movement } from './box/QuickGames';

const WellnessBox = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('menu');

    const handleActivityStart = (activity) => {
        setActiveTab(activity);
    };

    const ToolCard = ({ id, icon, title, desc }) => (
        <button onClick={() => handleActivityStart(id)}>
            <span className="icon">{icon}</span>
            <div className="tool-info">
                <span className="tool-name">{title}</span>
                <span className="tool-desc">{desc}</span>
            </div>
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            // Existing Tools (Refactored)
            case 'breathing': return <BoxBreathing onBack={() => setActiveTab('menu')} />;
            case 'grounding': return <Grounding onBack={() => setActiveTab('menu')} />;
            case 'patterns': return <PatternMatch onBack={() => setActiveTab('menu')} />;
            case 'balloons': return <BalloonPop onBack={() => setActiveTab('menu')} />;
            case 'movement': return <Movement onBack={() => setActiveTab('menu')} />;

            // New Mind Games
            case 'constellation': return <MoodConstellation onBack={() => setActiveTab('menu')} />;
            case 'ripple': return <BreathRipple onBack={() => setActiveTab('menu')} />;
            case 'orbit': return <OneWordOrbit onBack={() => setActiveTab('menu')} />;
            case 'drop': return <ThoughtDrop onBack={() => setActiveTab('menu')} />;
            case 'safeplace': return <SafePlaceBuilder onBack={() => setActiveTab('menu')} />;
            case 'slider': return <EmotionSlider onBack={() => setActiveTab('menu')} />;
            case 'sentence': return <UnfinishedSentence onBack={() => setActiveTab('menu')} />;
            case 'bodymap': return <BodyMapTouch onBack={() => setActiveTab('menu')} />;
            case 'choices': return <YesNotYet onBack={() => setActiveTab('menu')} />;
            case 'journal': return <NightSkyJournal onBack={() => setActiveTab('menu')} />;

            default: return (
                <div className="wellness-menu">
                    <div className="agent-ready-header" style={{ marginBottom: '3rem', textAlign: 'left' }}>
                        <h3 className="agent-ready-title">Wellness Toolkit</h3>
                        <p className="agent-ready-subtitle">Choose a gentle way to reset your mind.</p>
                    </div>

                    <div className="wellness-section" style={{ marginBottom: '4rem' }}>
                        <h4 className="section-title">Quick Reset</h4>
                        <div className="menu-grid">
                            <ToolCard id="breathing" icon="🌬️" title="Box Breathing" desc="Regulate your breath in 4 steps." />
                            <ToolCard id="grounding" icon="🖐️" title="5-4-3-2-1" desc="Connect with your senses." />
                            <ToolCard id="patterns" icon="🧩" title="Pattern Match" desc="Gentle focus and recall." />
                            <ToolCard id="balloons" icon="🎈" title="Balloon Pop" desc="Release tension with a tap." />
                            <ToolCard id="movement" icon="🏃" title="Micro Movement" desc="Shift your physical energy." />
                        </div>
                    </div>

                    <div className="wellness-section">
                        <h4 className="section-title">Deep Reflection</h4>
                        <div className="menu-grid">
                            <ToolCard id="constellation" icon="✨" title="Mood Stars" desc="Connect your feelings." />
                            <ToolCard id="ripple" icon="🌊" title="Breath Ripple" desc="Visual breathing rhythm." />
                            <ToolCard id="orbit" icon="🪐" title="Word Orbit" desc="Visualize your thoughts." />
                            <ToolCard id="drop" icon="🕳️" title="Thought Drop" desc="Let go of heavy thoughts." />
                            <ToolCard id="safeplace" icon="🏠" title="Safe Place" desc="Build your sanctuary." />
                            <ToolCard id="slider" icon="🎚️" title="Mood Slider" desc="Tune into your intensity." />
                            <ToolCard id="sentence" icon="✍️" title="Open Thoughts" desc="Finish the sentence." />
                            <ToolCard id="bodymap" icon="🧘" title="Body Map" desc="Locate somatic tension." />
                            <ToolCard id="choices" icon="⚖️" title="Yes / Not Yet" desc="Practice boundaries." />
                            <ToolCard id="journal" icon="🌌" title="Sky Journal" desc="Write to the universe." />
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="wellness-overlay" onClick={onClose}>
            <div className="wellness-modal" onClick={(e) => e.stopPropagation()}>
                {/* Standardized Top Bar */}
                {activeTab === 'menu' && (
                    <div className="voice-top-bar" style={{ padding: '2rem 4rem 0' }}>
                        <button className="voice-back-btn" onClick={onClose} aria-label="Close">
                            <span className="back-icon">✕</span>
                        </button>
                        <div className="voice-brand">Wellness</div>
                        <div className="top-right-space"></div>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default WellnessBox;
