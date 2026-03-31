---
title: "Function as Entity: A New Attempt at Porting Dark Forest to MUD"
date: 2024-08-20
author: cherryblue & ddy
category: Technology
summary: 'DFArchon reviews Dark Forest Ares (v0.1.1 through v0.1.4) and outlines porting Dark Forest to MUD. It proposes "function as entity": artifacts as ERC-721 bridges carrying composable state transition logic across planets, players, unions, and economics, with time/space and resource models aligned to onchain constraints.'
---

**_Introduction: In this article, we review the development of Dark Forest Ares over the past year and more, analyzing the foundational design architecture and scalability of Dark Forest as an onchain MMO game. We also discuss the concept of "Function as Entity", which represents a new attempt in our efforts to port Dark Forest to MUD._**

Dark Forest is a fully onchain MMORTS game that utilizes zkSNARKs and operates on EVM-compatible chains. Since the release of Dark Forest v0.6.5 in early 2022, the official team has not introduced new rounds. Driven by our belief in the onchain MMO vision and our passion for Dark Forest, our team (DFArchon) decided to continue maintaining **Dark Forest Ares**, an community-maintained **sovereign** version of Dark Forest.

Ares, the god of war, symbolizes the power of conflict and battle. As the son of Zeus and Hera, he is often associated with fighting and the chaos of warfare. We chose this name to emphasize the free-for-all (FFA) style features, reflecting the intense competition and strategic elements within onchain MMO games.

From early 2023 to mid-2024, we released 4 different game versions of DFAres, from v0.1.1 to v0.1.4.

In July 2023, we released DFAres v0.1.1: Magic Artifacts, where we introduced artifacts like Fire Link and Ice Link for long-range interactions. Players had to face challenges not only from nearby opponents but also from threats emerging from various corners of the universe.

In January 2024, DFAres v0.1.2: Pink Ship was released, featuring the pink ship that throws bombs to create pink circles. Any planets within these circles could be destroyed. Additionally, we modified the ZK circuits to enable controllable generation of cosmic resources without revealing the exact coordinates of the planets.

In May 2024, DFAres v0.1.3: Kardashev was introduced, which brought the Kardashev artifact. Activating this artifact generates a blue circle that enables planets within it to instantly transfer energy and silver to the circle's center planet, facilitating rapid resource mobilization. We also implemented preliminary economic model features, including the functions to purchase planets, artifacts, and skins, as well as introducing a bounty system where players, known as "bounty hunters," can attack specific planets to earn bounties set by sponsors.

In August 2024, DFAres v0.1.4: Union was released. This version introduced a union system, allowing players within unions to send energy to support each other. Additionally, we implemented a dynamically shrinking inner radius to prevent top players from rapidly capturing the center of the universe, thereby ensuring a more balanced game pace.

Our next development plan involves porting Dark Forest to MUD. Here are some of our thoughts on game architecture and scalability. The core idea is to attach state transition functions to the artifacts within the game, using artifacts as a bridge to connect all entities in the game. This approach aims to leverage the composability advantages of fully onchain games as much as possible. We are drawing inspiration from functional programming concepts to guide the development.

# _0. Time & Space_

In game design, time and space are two key elements.

_Time is an input for all state transition functions_ and progresses with the generation of new blockchain blocks. To achieve speedup or slowdown, we need to introduce a **time factor**.

The space is represented as a circular universe on a two-dimensional plane. _The universe is a container for planets_.

We enjoy infinite games, and blockchain inherits our expectations and aspirations for infinity. However, due to limited blockchain computing resources and challenges in consensus synchronization, we need to set constraints on time and space to define the scope of the game. The time constraint is the **timestamp**, and the spatial constraint is the **radius** of the circular universe.

Please note that the timestamp does not represent the end of the game. The timestamp indicates that player actions will be summarized at this milestone, but players can still interact with the game universe. The radius of the space can also be expanded or contracted based on the progression of time.

# _1. Energy & Silver_

In the universe, the fundamental entities are planets. _A planet is a resource carrier that has specific spatial coordinates_.

The primary resource is energy, and derivative resources include silver. We can also introduce more types of resources.

_Energy is generated on planets and can be transferred between them_.

_Silver is generated on planets, and silver can be transported along during the process of energy transfer_.

For planets, we can categorize their attributes into three types: **Constant, Config, and State**.

**Constant** refers to attributes that remain almost unchanged during the game, such as the planet's coordinates and type.

To implement fog of war effects, zkSNARKs is used to validate that the move operations of transferring energy between planets are valid while keeping the planet coordinates hidden.

Config refers to attributes that occasionally change during the game, such as a planet's range, speed, and defense. Planets can upgrade by consuming silver mines or meeting other requirements, and these upgrades will change the planet's config attributes.

State refers to attributes that frequently change during the game, such as the planet's owner, energy, and silver. For discrete state values like the planet's owner, updates can be made promptly when players submit transactions. For attributes that continuously change over time, such as energy and silver, a lazy update mechanism is used for updating them.

Typically, the initial values for Config and State are generated from global game parameters and the planet's Constants.

When we want to expand the game, a convenient method is to store the information that the planet Entities need to record as State attributes.

# _2. Player control a set of planets_

Part of the gameplay is to collect planets. Players send energy to attack other planets to expand their collection, while enemies send energy to attack my planets to reduce the number of planets in my collection.

Attributes attached to player entities can be categorized into two types. The first type includes records of player operations, such as initialization time, the number of planets owned, and score statistics based on specific rules. The second type records the relationships between players and other entities, such as homePlanetId and unionId. These player attributes can also be used to impose certain constraints on subsequent player actions, such as using timestamps to control cooldown times for specific actions.

Regarding the expansion of player entities, the first areas to address are the development of the whitelist module and the player invitation mechanism module.

For operational convenience, fully onchain game clients often use burner wallets. The private keys of burner wallet accounts are stored in the browser's memory, which is relatively insecure and carries risks of loss and leakage. On the other hand, important items generated during the game are best stored in more secure accounts. Therefore, developing modules for delegated calls or permission management is also essential.

Game players also have real-world social needs, such as sharing game content or performance on social media, which helps in promoting the game more broadly. Therefore, it is necessary to develop interaction modules with social media platforms like Twitter or Facaster, or integrate with ENS.

# _3. Union is a group of players_

A union is essentially a collection of players.

In MMO games, the union system is crucial as it is a key way to shape player identity and a sense of belonging. Unions can hold resources within the game, and union members need to work together to decide how to use these resources to maximize the union's benefits. Different DAO governance structures can be introduced to enrich the depth of the game, providing simplified versions of various political systems.

# _4. The artifact carries state transition functions_

The artifact is the concretization of game state transition functions. This is the most important part of this article.

In terms of external composability, artifacts are represented as NFTs defined by the ERC721 standard, which means artifacts can fully enjoy liquidity within all base services built on the ERC721 standard.

In terms of internal composability within the game, artifacts can serve as highly flexible bridges, connecting all entities within the game.

Artifacts revolve around planets and move by consuming energy, allowing them to be transferred between different planets.

The artifact can alter the state of an individual planet.

The artifact can alter the state of two planets. For example, the wormhole artifact can link two planets, and shorten the distance for energy transfer between them, while another artifact can make an ice link that would freeze both planets.

Additionally, the artifact could affect a group of planets, such as a nuclear explosion creating a pink circle that destroys all planets within the affected area.

_The artifact carries state transition functions. At the same times, artifact is entity within the game. the state of artifacts can serve as input to state transition functions._ This somewhat recursive structure implies that extremely complex game rules and mechanics can be built around artifacts, greatly leveraging the advantages of interoperability and composability in fully onchain games.

We can encapsulate operations of other game entities (such as planets, players, etc.) into a foundational protocol, with the state transition functions carried by artifacts being developed as game modules based on this underlying protocol.

We can develop systems for artifact synthesis, implement mechanisms for balancing artifacts, or utilize artifacts to create economic models and honor systems for player unions.

Players can even create their own desired functionalities based on the foundational protocol for interactions between planets and players entities, and materialize these functionalities as ERC20 or ERC721 tokens. We believe that **function as entity** is a significant embodiment of the composability advantages in fully onchain games.

# _5. Economics model_

The economic model layer can fully leverage the latest advancements in DeFi protocols. Recently, we have been particularly interested in exploring the application of flash loans in fully onchain games or autonomous worlds. This could unlock innovative possibilities for economic interactions within these environments.

# _6. Ranking Mechanism_

As analyzed in [Composable Game as a Service](/blog/composable-game-as-a-service) , different ranking systems can significantly impact players' gaming experiences. We believe that ranking mechanisms can generally be categorized into three main orientations: honor shaping, entertainment, and incentives. We will focus on developing a ranking system centered around honor shaping.

This concludes the content of this article. Our goal is to achieve a proof of concept within this year to validate our ideas. Building on our experience and accumulated knowledge, we intend to develop a larger-scale onchain MMO game. **We warmly invite you to join us**.
