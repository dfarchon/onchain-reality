---
title: The Dilemmas of Constructing Onchain Digit Worlds
date: 2025-08-30
author: ddy
category: Reflection
summary: "A grounded look at five tensions in building onchain digital worlds: decentralization versus cost (mainnet limits, L2/L3 tradeoffs, and what world computer means); ETH volatility and gas shaping player behavior and adoption; rule predefinition and code versus open-world balance and contract risk; privacy gaps on transparent chains; and finding an audience amid competition. These dilemmas need technology, compromise, and shared effort from builders and participants, not slogans alone."
---

In the realm of building large-scale decentralized applications, there exist a multitude of ideological narratives and visions of the future. Certainly, crafting and debating these narratives is important. However, these romantic words will not automatically transform into smart contracts on the blockchain, nor will they attract thousands of participants to emerge from nowhere and engage actively. When developing large-scale onchain applications, we inevitably encounter a variety of dilemmas. If we truly believe that Ethereum is the world computer, then I hope we can engage in a serious discussion about the challenges of constructing worlds onchain.

# 1. Concerns About Decentralization

Development teams generally aim to build and deploy projects on more decentralized platforms. However, the more decentralized the platform, the higher the costs tend to be, and they are often unable to bear such costs before market consensus forms or a project gains traction. For example, deploying on Ethereum mainnet comes with prohibitively high gas fees that only support small-scale applications, such as ERC20 or NFT contracts with simple game-theoretic mechanisms, and this still falls far short of the complex onchain world applications we aim to build. As a result, most teams exploring this space today opt to build on Ethereum L2 or L3 networks, while some choose to set up their own infrastructure. If all onchain worlds end up deployed on Ethereum L2 or L3 networks, can Ethereum still truly be called the "world computer"? I think this is an interesting question.

# 2. The Paradox of $ETH Volatility

In July, we conducted a three-week public test of Dark Forest MUD v0.1.4 on Ethereum L2 Base, a fully onchain universe-competition game built with ZK technology. Because every player action requires an onchain transaction, gas prices on the underlying infrastructure have a direct and significant impact on player behavior. That July, Ethereum experienced a sharp price surge, and the Base ecosystem was simultaneously booming with activity. This caused the cost of player interactions to spike, discouraging deeper engagement with the game. This was the primary reason we chose to host the Dark Forest Commemorative Round (a revised version of DF v0.5 from 2020) in August on Optimism, where gas fees are not only lower than Base but also more stable.

On ETH-denominated blockchains, a rising ETH price is often accompanied by increased market activity and greater attention to applications. However, higher transaction costs make it more difficult for applications to attract participants. This negative feedback loop can hinder the growth and adoption of onchain applications.

# 3. On the Discussion of Rule Predefinition

In the crypto world, people often emphasize "code is law," highlighting the importance of predefining rules. I also strongly agree with the significance of rule predefinition, but when developing large-scale applications, various situations arise that require adjustments to the application.

Here, I want to discuss two such scenarios. The first scenario involves underlying design issues in the digital world. Since the groups interacting with world contracts are often fluid, we cannot control every aspect as rigorously as in Web2 games. How can balance be maintained in an open world when participants are constantly moving? This is a question that every world builder must carefully consider.

The second scenario arises when smart contracts are used to implement the design intentions of the world. Inevitably, this introduces potential programming vulnerabilities, which can lead to unexpected and severe consequences, especially in open worlds where an economic system has already been established.

# 4. On Privacy Protection

Privacy is extremely important. Just as we need to protect our privacy in the physical world, it is equally necessary to safeguard privacy in onchain digital worlds. However, the current state of privacy protection is concerning. We lack mature tools for private communication, and many people, influenced by large corporations, fail to recognize the importance of privacy. The combination of personal data leaks and recommendation algorithms often leads us to spend more on products.

Onchain world applications inevitably leave a large amount of personal data on the blockchain that can be used for secondary analysis. This makes the need for privacy protection even more urgent and also places higher demands on the design of world protocols.

# 5. On Audience and Market Competition

If we believe that onchain digital worlds will become an influential subcultural trend in the future, where is our audience? How can we spread and popularize our ideas, and how can we increase people's recognition of this narrative? We need to think carefully about how the broader public perceives this world.

Finding your true users and audience in the market is not easy. On one hand, we need to cautiously communicate our ideas to the public and embrace our supporters with precision. On the other hand, we must also defend against potential malicious attacks and unrestrained competition.

# The Conclusion

The issues listed above illustrate some of the challenges that may arise when constructing onchain digital worlds. Some of these problems might be resolved with advances in underlying technology, while others may inevitably require certain compromises. Regarding these challenges, we may have vague intuitions and value-driven inclinations, but these are not definitive answers. These dilemmas will not disappear if ignored; they require the collective effort of world builders, developers, and participants to confront and address. Only by facing these challenges directly and engaging in in-depth discussion and experimentation can onchain digital worlds truly evolve into a new form of human digital civilization.
