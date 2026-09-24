# Advanced-programming-project

## Running the MVP

Requires Node.js LTS.

```powershell
npm install
npm start
```

The game works entirely with its prewritten dialogue by default. To enable optional OpenAI dialogue delivery phrases, set both environment variables before running:

```powershell
$env:OPENAI_API_KEY="your_api_key"
$env:OPENAI_MODEL="your_model"
npm start
```

Never commit API keys. Copy the variable names from `.env.example`; the game automatically falls back to prewritten dialogue if either setting is missing or the API call fails.

## 1. The demo
I open the game and start a new murder mystery. I am told that one of the three suspects committed the murder, and I can talk to each of them by typing questions. Each has access to different information, so they answer based on only what they know. For instance, one suspect knows that they saw another character near the crime scene, while another one doesn't. I can ask questions, inspect pieces of evidence, and then type the name of the person I think could be the murderer. The game tells me whether my accusation is correct and the investigation ends.

## 2. The shape
in            a new game containing three suspects, a murder, a small number of locations and pieces of evidence
out           an accusation by the player and a result whether it was correct or not
in between    the player gets to investigate the crime by talking to NPC agents, asking questions, receiving info based on NPC's knowledge and memories, and examining evidence

## 3. The size
### First useful version: small but playable already
- 3 NPC suspects
- 2-3 locations
- 1 murderer
- a small set of evidence
- being able to converse with NPCs
- different info, knowledge, and memories for each NPC
- a final accusation
- a simple interface (I'd say command-line only)
- LLM agents controlling the NPCs' responses and decisions

### What it does NOT do this term
- sophisticated graphical game
- dozens of NPCs
- a large map with tens of locations
- complex animations
- voice interaction
- fully open-ended NPC actions
- long-term memory accross separate runs
- a large neural network

## 4. How we would know it works
- I think the most telling is this: given an NPC who has not been told a particular fact, it should not be able to use that fact in its decisions or responses.
- Given an information is shared between NPCs, for example, NPC A tells NPC B something, then NPC B's knowledge state should only have the information after telling.
- Given that the killer is known by the game engine, the player should receive either the correct result (if the accusation is correct) or an incorrect one if they accuse an innocent NPC.

## 5. What could stop this
It is a project I have not done before; I haven't tried making a game yet.
The LLM/agent architecture is also a risk, in my opinion, because I have to test and see early whether an LLM can reliably return the required actions or not (I mean no hallucation).
API access and response time could be another risk, so the game should always have a fallback version.

Also, the game uses fictional characters and artificially generated game data, so no personal or sensitive data is required. Both the game and sample datasets can be shown during presentation and shared in the repository.
