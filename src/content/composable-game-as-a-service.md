---
title: Composable Game as a Service
date: 2024-07-10
author: cherryblue
category: Technology
summary: Composable Game as a Service (CGaaS) applies a modular, RaaS-like stack to fully onchain games. Drawing on Dark Forest and the Dark Forest Ares fork, it outlines composable layers (rules, artifacts, players, economy, scoring), benefits for players, chains, and teams, and prerequisites such as FOSS community and a cohesive narrative.
---

The emergence of **programmable blockchain platforms** has introduced us to a new cyberspace, one that points to an infinite future. No one can unplug it, and all our interactions with it are permanently recorded in the blockchain. Cryptography and consensus algorithms provide a solid foundation for all this. In this cyberspace, everyone can deploy decentralized applications in a permissionless manner. These applications can freely interact with each other according to predefined rules in their code, creating a rich tapestry of functionalities.

The core spirit of this cyberspace inherently contains an impulse to blend everything together. This is part of the crypto-native ethos. On one hand, we want applications to run smoothly according to pre-defined rules. On the other hand, we hope to **break through the boundaries between applications**, allowing them to connect in unexpected ways and create something wonderful. Developers often refer to this as **permissionless** **interoperability** and **composability**.

The onchain game developer community has been exploring the frontier of this field. Our team has always aspired to build more ambitious large-scale decentralized applications, and we have always believed in the immense potential of autonomous worlds. However, in this article, I will not delve deeply into autonomous worlds. Instead, I will discuss their initial form: composable game. I would like to use Dark Forest as an example to explore the potential of **Composable Game as a Service**, an intriguing concept proposed by our team.

# WTF Composable-Game-as-a-Service (CGaaS)

As many are aware, with the improvement of blockchain infrastructure, Rollup-as-a-Service (RaaS) has emerged. This reflects a modular approach, where Rollup can be divided into relatively independent layers such as the Data Availability layer, the Settlement layer, the Sequencer layer and so on. Each layer can provide different modules. When there is a need for an appchain, these modules can be combined according to specific requirements to achieve customized deployment of the appchain. We see similar possibilities in Dark Forest.

It is necessary to briefly review the development history of Dark Forest here. **Dark Forest is a fully onchain MMORTS game created using zkSNARKs**. The game takes place in a procedurally generated infinite universe where players, bots, AIs, and even smart contracts compete fiercely for galactic supremacy. It is a hardcore space-themed strategy game. Throughout its development, **the Dark Forest community has cultivated a unique culture that encourages community-driven development**. In addition to utilizing the game client's interface to develop various plugins with different functionalities, players can also fork the game's code to add and update various game modules and features they desire.

In Dark Forest v0.6 Round 5, the official development team introduced the lobbies system. Lobbies are a fully on-chain configuration and deployment system for your own Dark Forest universe(s). With the lobbies system, players can adjust game parameters and quickly deploy new game universes. This parameter-based adjustment model requires players to have a thorough understanding of each fundamental game parameter, which objectively limits the game's potential to spread to a broader audience.

An improvement method involves modularizing this large-scale application, providing different design alternatives within each module to support diverse customization needs and introduce a variety of applications. We refer to this concept as **Composable-Game-as-a-Service (CGaaS)**. This service targets blockchain platforms, allowing them to customize games according to their specific requirements to attract different types of users or players. The development team can also use it to rapidly iterate, develop, and compose various different game applications.

We believe the openness and composability inherent in fully onchain games can effectively support such a paradigm. In the long term, CGaaS aims to maximize code reuse, thereby reducing development costs.

# Transforming Dark Forest into CGaaS

Throughout the 5-year development journey of the Dark Forest community, numerous game design ideas and projects have accumulated. For our team, we started playing Dark Forest in 2021 and developed many plugins and ecosystem projects, including **automation bots** and **killer bounty platform**. **At the beginning of 2023, we decided to maintain our own fork version of Dark Forest**, which we named **Dark Forest Ares**. We have already released **three distinct game versions** and plan to launch more game design versions later this year. I strongly believe that we should break down the boundaries between these game design ideas and versions, ultimately blending them together.

For the game Dark Forest, it can be briefly categorized into the following layers:

**Natural Rules Layer**: Includes types and positions of planets, rules for energy growth on planets, rules for inter-planetary attacks, and the mechanics of the fog of war.

**Artifact Layer**: Involves various artifact items, each with different functionalities.

**Player Layer**: Attributes possessed by players, and the player guild system.

**Economic Model Layer**: Includes trading of silver, exchange of player scores, artifact transactions, and the bounty hunter platform.

**Scoring Rules Layer**: Includes rankings based on distance from the center of the universe, rankings based on the amount of silver owned and so on.

These layers all affect how players will generally act within the game. In the scoring rules layer, for example, when ranking by distance from the center of the universe, players engage in territorial competition near the center, creating a zero-sum game scenario where intense battles occur among players. Ranking by the amount of silver owned motivates players to occupy more planets to gather additional silver. When distributing game bonuses based on specific combinations of collected artifacts, the game becomes a collection-based game. Under these three scoring rules, players' gaming experiences vary significantly. Furthermore, different layers can be combined with various modules, allowing for the selection of different scoring rules and economic models to shape diverse game objectives. Players can thus experience a variety of gameplay by making different trade-offs and choices. Blockchain platforms or players can also use economic incentives to encourage development teams to create desired modules and features.

# Advantages of CGaaS

For players, it reduces the learning curve of operating applications and allows them to experience different game pleasures through various module combinations.

For blockchain platforms, it addresses the issue of lacking blockchain applications. Composable games can provide customized application solutions based on the needs of blockchain platforms.

For composable game development teams, it allows for flexible development plans based on foundational project frameworks and existing modules.

This design philosophy encourages developers to innovate and explore new application modules and technological solutions, driving ecosystem development.

# Prerequisites for CGaaS

Several conditions must be met for composable applications to succeed. Firstly, development requires an active community of developers who embrace **Free and Open Source Software (FOSS)** and **decentralized values**. A core team must establish a highly scalable development architecture and protocol while coordinating progress among different development groups. Secondly, as a service, composable applications need diverse design solutions across various module layers to leverage scalability advantages. Early-stage development costs are high, necessitating perseverance from the core development team with limited societal resources initially. Thirdly, there must be a **cohesive narrative** supporting the application worldview, with modules developed to align closely with this unified perspective.

That concludes this article. In the future, we may publish more articles to explore the feasibility of transforming Dark Forest into a Composable-Game-as-a-Service and discuss the advantages of MUD engines in constructing Composable-Game-as-a-Service, or other topics related to fully onchain games. **If you are interested in our future development plans, feel free to contact us**.

I extend my sincere gratitude to all the friends who helped review.

We will host the game beta testing event for Dark Forest Ares v0.1 Round 4 in August, and we welcome everyone to participate.
