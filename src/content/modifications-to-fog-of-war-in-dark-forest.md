---
title: Modifications to Fog of War in Dark Forest
date: 2024-08-31
author: calex & ddy
category: Technology
summary: "How Dark Forest uses zkSNARKs to hide planet coordinates while proving moves; how the Dark Forest Ares fork added distanceFromOrigin to ZK circuits to rebalance center-focused play (trading some privacy on distance for fairness); and future ideas: time-zone sector buffs and variable map mining difficulty near the center."
---

**Please note that our team members are not ZK experts. The content we discuss is more based on perspectives from game application product development, so the concepts we share may have some inaccuracies.**

Dark Forest is a decentralized, real-time strategy game that operates entirely on the EVM blockchain. The game leverages zkSNARKs to enable private and scalable transactions. Players explore a procedurally generated universe, capture planets, and compete against each other in a zero-sum conquest.

The reason we consider Dark Forest a decentralized game is that its entire logic runs on smart contracts. Players interact directly with the blockchain, making the game tamper-proof and resistant to central control.

In an interstellar dominance game, the coordinates of planets are crucial pieces of information. As we know, data on the blockchain is entirely public (except Monero and other privacy chain). By using zkSNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge), it is possible to verify the existence of planets and the validity of energy transfer moves between planets without revealing their coordinates. This achieves the "fog of war" effect. It sounds very much like a magic trick of deception!

In this article, we will analyze the fundamental ZK architecture of Dark Forest, discuss the modifications made to the ZK circuits during the development of Dark Forest Ares (AKA DFAres, a community-run forked version of Dark Forest) , and share some ideas for future development.

# Dark Forest ZK Architecture

Since the release of Dark Forest v0.3 in August 2020, many articles and videos introducing the application of zero-knowledge proof technology in Dark Forest have been published. Here, we provide some articles and videos that we consider excellent introductions.

[Zero-Knowledge Proofs for Engineers: Introduction
](https://blog.zkga.me/intro-to-zksnarks)

[ZKPs for Engineers: A look at the Dark Forest ZKPs](https://blog.zkga.me/df-init-circuit)

[Dark Forest - One interesting game with zk-SNARK technology
](https://trapdoortech.medium.com/dark-forest-one-interesting-game-with-zk-snark-technology-47528fa7691e)

[Dark Forest: A Beacon of Light for Blockchain Games](https://naavik.co/deep-dives/dark-forest-beacon-of-light/)

This article introduces the application of Perlin noise in fully onchain games. In Dark Forest, Perlin Noise validation is handled within the ZK circuits. Reading this article will help in understanding this aspect.

[On-chain Procedural Generation](https://0xparc.org/writings/procgen)

# Modifications to ZK in Dark Forest Ares

Dark Forest Ares is forked version of Dark Forest maintained by DFArchon since early 2023. We aim to explore different game mechanics in the direction of onchain MMO. Through in-depth interactions with the player community, we find that the game mechanic of advancing towards the center of the universe to claim the central position is highly welcomed by players. This mechanic is initially introduced in Dark Forest v0.6.3, but two aspects need optimization. On one hand, the original Dark Forest map is completely random, which often leads to players encountering a level 9 planet blocking their progress towards the center. On the other hand, players' familiarity with the game varies, resulting in OG players frequently capturing the center of the universe on the first day of a week-long game.

To optimize the game mechanics, we introduce a new variable, distanceFromOrigin, in the ZK circuits. By introducing this variable, we can set custom planet levels and space types based on the distance from the center of the universe. As shown in the figure below, planets closer to the center have higher levels, and we set a deep blue player spawn area at the edge of the center. We also introduce an inner radius that starts with a larger value and gradually decreases to zero as the game progresses. Players can only operate within the region between the inner radius and the outer ring radius, greatly enhancing game balance.

```
signal input targetDistFromOriginSquare;
targetDistFromOriginSquare === x2Sq + y2Sq;
```

This approach leaks the distance between planets and the center of the universe but does not reveal the specific coordinates of the planets. Therefore, the game remains a fog-of-war game, and game balance is significantly improved. After careful consideration, we believe this trade-off is acceptable in the short term. In the long term, we are also discussing internally whether this validation can be integrated directly into the zero-knowledge proof circuits.

<figure>
  <img
    src="/images/blog/fog-of-war/1.avif"
    alt=""
    width="600"
    style="max-width: 100%; height: auto;"
  />
  <figcaption>the whole map mined using the GPU miner</figcaption>

</figure>

# Future Designs Discussion

During previous rounds, we found that players' temporal habbits in different timezone around the world may cause an unfair competition. For example, round start time may be late at night in certain time zones, and players in these time zones will need to stay up late to make progress in the very important early game stage. Therefore we need a set of rules for players in all time zones around the world. A relatively effective way is to seperate the space into 24 areas according their position if we see the space as a giant circular clock.

## Sector area (notation)

When the playable ring is modeled as a sector of a disk, let $\theta_t$ be the central angle in radians at time $t$, and $r_w$ a radial width. The sector area is:

$$
\theta_t = \frac{t + 12}{12} \pi
$$

$$
S_t = \frac{1}{2} \theta_t r_w^2
$$

where $t$ is UTC time and $r_w$ is the world radius. We can also seperate the space in less areas like 12 or 6 depending on different granularity requirement.

<figure>
  <img
    src="/images/blog/fog-of-war/2.avif"
    alt=""
    width="600"
    style="max-width: 100%; height: auto;"
  />
  <figcaption>the whole map mined using the GPU miner</figcaption>
</figure>

Then each sector will get speed buff(+150%) in turn when realworld time flies. For example, when it is 8am in UTC+2 timezone, planets in blue area above will get a buff that last 1 hour to send energy or artifact. Another way is to freeze those areas not in allowed time period. Practically, it maybe apropriate to have 4 sectors in total, that players in each area on need 24/4=6 hours per day to focus on the game protecting our players' livers from staying up.

This new feature requires some modification in former ZK circuits. The specific implementation still needs to be discussed.

# Layered difficulties control of space map mining

We also noticed that the flat map mining way may be not the best practice. Flat map mean wherever the location is in space, the mining diffcultiy stay unchanged. Apparently, if the goal of a round is to conquer the central planet in space, the mining diffculties should be harder and harder when players approaching space center. Since map mining is actually to calculate the hash and perlin given (x,y) , we can develope a variable diffculty method to dynamically control the speed of map mining. Currently DF uses MiMC algorithm with 220 rounds calculation. A preliminary idea is to introduce a variable round. Anyway, everything needs to be discussed carefully.

# Summary

This article introduces the Dark Forest game and the ZK technology architecture used, then provides a detailed analysis of our explorations and considerations regarding adjustments to the ZK circuits for game balance during the development of Dark Forest Ares. Finally, we discuss and introduce two interesting ideas: **clock-like space sharding** and **layered difficulties control of space map mining**. To offer a starting point for discussion, we welcome everyone to join us in exploring the integration of ZK and onchain gaming !
