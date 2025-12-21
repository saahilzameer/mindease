# MindEase: 10 Interactive Wellness Games Design

## Global Design Language
- **Theme**: "Cosmic Calm" (Deep Navy, Starlight, Soft Purple).
- **Core Mechanic**: Zero-pressure interaction. No scores. No timers.
- **Feedback**: Instant, fluid, soft glow, micro-haptics (visual).

---

## 1. Mood Constellation
*   **UX Flow**: User sees a dark sky with faint stars -> Taps stars that resonate -> Stars glow and connect with soft lines -> After visual is done, AI reflects.
*   **UI Layout**: Full-screen canvas. Bottom prompt: "Tap the stars."
*   **Animation**: Stars fade in. Lines draw slowly (SVG stroke-dashoffset).
*   **Copy**: "Every star is a feeling. Connect them."

## 2. Breath Ripple
*   **UX Flow**: Visual instruction "Hold to Inhale" inside a circle. User holds -> Circle expands. User releases -> Circle contracts "Exhale".
*   **UI Layout**: Central glowing orb. Ripple rings emanating outward.
*   **Animation**: Scale transform with ease-in-out. Opacity fade for ripples.
*   **Copy**: "Hold to breathe in... Release to graze out."

## 3. One-Word Orbit
*   **UX Flow**: Input field "One word...". User types -> Word floats into a 3D orbit around a central "planet" or core.
*   **UI Layout**: Center core (User). Words orbiting at different speeds/distances.
*   **Animation**: CSS 3D transforms rotating endlessly.
*   **Copy**: "What are you carrying? Put it in orbit."

## 4. Thought Drop (Refined)
*   **UX Flow**: User types a worry -> Card appears -> User drags card into a "Black Hole/Void" at the bottom -> Card sucks in and dissolves.
*   **UI Layout**: Top input. Draggable card in center. Glowing gradient void at bottom.
*   **Animation**: Card follows cursor. On release near void: scale down + rotate + fade out (suck effect).
*   **Copy**: "Drag it to the void. Let it go."

## 5. Safe Place Builder
*   **UX Flow**: Toggle bar at bottom (Sound, Light, Sky). User taps -> Background cross-fades.
*   **UI Layout**: Immersive background taking 100%. Minimal controls overlaid at bottom.
*   **Animation**: Smooth opacity transitions. Parallax clouds/stars.
*   **Copy**: "Build a space where you are safe."

## 6. Emotion Slider
*   **UX Flow**: Simple slider. User drags. Background color changes from Red (Heavy) to Blue/Teal (Light/Calm).
*   **UI Layout**: Vertical or Horizontal slider. Full screen background color.
*   **Animation**: Real-time HSL color interpolation.
*   **Copy**: "How heavy is the weight right now?"

## 7. Unfinished Sentence
*   **UX Flow**: Card shows "I am..." -> User types.
*   **UI Layout**: Minimalist typography. Center focus.
*   **Animation**: Text fades in. Blinking cursor.
*   **Copy**: "No thinking. Just finishing."

## 8. Body Map Touch
*   **UX Flow**: Outline of body. User taps head, chest, etc. -> Glowing orb appears there.
*   **UI Layout**: SVG Body outline.
*   **Animation**: Pulse animation on tap locations.
*   **Copy**: "Where does the tension live?"

## 9. Yes / Not Yet
*   **UX Flow**: Two giant cards. User taps one. No wrong answer.
*   **UI Layout**: Split screen or two large buttons.
*   **Animation**: Hover scale. On tap, the other fades away.
*   **Copy**: "Are you ready to forgive yourself today?"

## 10. Night Sky Journal
*   **UX Flow**: User types text -> Hits send -> Text turns into a star. Hovering star reveals text.
*   **UI Layout**: Infinite sky.
*   **Animation**: Text shrinks into a dot (star) and floats up.
*   **Copy**: "Cast your thoughts into the sky."
