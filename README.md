# Advanced-programming-project

- *problem and project brief:* I'd wanna create a game, I just don't know what level of difficulty fits the semester. I like detective games so for now, I was thinking that the AI agents are NPCs and one of them committed a murder and the player has to talk to them and find out which one. They could have different personalities, goals, different relationships with the other characters, memories, they could use tools, beliefs, etc. I'd wanna somehow add ML into it so maybe I could use ML to predict the player's game style (aggressive, peaceful, etc) and then the Game Master agent could adjust the NPCs behaviour accordingly
- *specification:* I should come up with the game requirements (NPCs, locations, evidences, etc) and within that the NPC requirements (goals, personalities, etc) and the ML question which could be related to predicting the player's behaviour
- *technical spike:* a simple interface, I don't know if graphics should be needed
- *walking skeleton:* for now I'd say: input --> agent --> decision --> game-state change --> output
- *tests:* testing game-state changes, like if an agent tells something to another agent, that agent should remember that; they shouldn't hallucinate and magically know facts they weren't given
- *first useful version:* a smaller version of the final game; only a few NPCs, fewer locations, not as many actions yet but NPC personalities, goals, relationships should exist already
- *integration and debugging:*
- *review and refactoring:*
- *reproducible release:* providing a readme, requirements, the trained ML model and the dataset used for training
- *presentation and defence:* playing it or letting someone play it
