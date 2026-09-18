// Feature killswitch: flip the flag for whichever iteration you're demoing.
// Iterations are additive, so the highest true flag wins — e.g. leaving
// iteration1 true and setting iteration3 true also unlocks iteration2.
const flags = {
  iteration1: true,
  iteration2: false,
  iteration3: false,
  iteration4: false,
}

const ITERATION_KEYS = ['iteration1', 'iteration2', 'iteration3', 'iteration4'] as const

const currentIteration = ITERATION_KEYS.reduce(
  (level, key, index) => (flags[key] ? Math.max(level, index + 1) : level),
  1,
)

export const display = {
  iteration1: currentIteration >= 1,
  iteration2: currentIteration >= 2,
  iteration3: currentIteration >= 3,
  iteration4: currentIteration >= 4,
}

// iteration 1
// login, signup onboarding, account management
// views - no dashboard or recipes page, login and signup completion redirects to account management page immediately. no navbar yet.

// iteration 2
// main dashboard (meal plan), pantry ingredient entry, recipe page and discover tab
// views - show only pantry list on the main page with no meal plan section, pantry should be fully functional, and display the recipe page on the navbar
// cont. navbar now shows completely. recipe cards will have the available ingredient tabs hidden

// iteration 3
// meal planning, grocery list/generation,
// views - display normal dashboard and normal grocery/pantry. recipe cards now show the hidden ingredient tabs

// iteration 4
// recipe upload tab, saved recipe tab,
// views - simply display the tabs
