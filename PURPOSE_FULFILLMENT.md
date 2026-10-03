# Purpose Fulfillment

Purpose Fulfillment is the first-contact and pathway layer for Resonance. It does not replace Human Design, astrology, Cynthia, the network, Lab/work surfaces, or Agentic Reality.

## First contact

Cynthia begins conversationally:

> Hi, I'm Cynthia. Welcome to Resonance. What's your name?

She then asks about what shaped the person, who they believe they are, what they think their purpose is, where they are now, where they want to be, whether they are happy with the current state, what blocks them, their strengths, and what they repeatedly care about.

Each answer becomes local state under `resonance:purpose` and is best-effort landed into the existing Foundation journal.

## One calculation law

Purpose never creates a second Human Design or astrology calculator.

If `resonance:calculated-profile` already exists, Purpose uses it. If it does not, the intake routes to the existing Profile/origin flow, whose `consciousness.calculateProfile` result is the same calculated origin used by the rest of Resonance.

## How the first pathway is made

The person's own answers establish the practical problem: current state, desired state, friction, strengths/interests and stated purpose.

The saved Human Design layer then informs **how to approach and decide**, using Type / Strategy / Authority / Profile. Cynthia translates that internal structure into normal language rather than dumping Human Design jargon as the answer.

Current first-stage routing:
- **Discover** when purpose is unknown: test contact with recurring interests/strengths instead of inventing a purpose statement.
- **Unblock** when a concrete blocker dominates: reduce or route around the smallest tractable friction.
- **Experiment** when direction exists: choose one small observable test toward the desired state.

Each pathway ends with an evidence request: what was tried, what actually happened, what was easier/harder than expected, and whether the outcome changed the next option.

## Learning law

`possibility -> action -> observed outcome -> discrepancy/evidence -> next pathway`

Reality is allowed to correct the model. The chart is an input to the hypothesis; it is not treated as a command that predetermines the person's job or life.

## Current implementation

The integrated v13 artifact adds Purpose to the existing 223-module v12 state-space build without altering the seven ATO/Klein state-space modules or latest v12 Foundation module.

The React Native source branch also contains:
- `Core/PurposeStore.js`
- `Core/PurposeEngine.js`
- `PurposeScreens.js`
- Purpose return flow in `ProfileScreens.js`
- Purpose-first entry/home flow in `App.js`
