# omo-hackfs

_Note that you will need to have [Node.js](https://nodejs.org) installed._

## Get started

Install the dependencies...

```bash
cd omo-hackfs
npm i
```

...then start webpack:

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see your app running. Edit a component file in `src`, save it, and the page should reload with your changes.

Important links:

- https://circles.garden/welcome
- https://graph.circles.garden
- https://dashboard.joincircles.net/
- https://web3js.readthedocs.io/en/v1.2.11/
- https://github.com/CirclesUBI/circles-core (readme & code)
- https://github.com/CirclesUBI/circles-baby-phoenix
- https://thegraph.com/docs

# Brainstorming ProcessFlows

## OdentityFlows

### OdentityFlow 1

1. email magic link

### OdentityFlow 2

1. Welcome Slideshow
2. login success email authentication success (show every details step of odentity) (F)
3. create PPK (web3) (F)
4. create gnosis safe (F)
5. giveTrust gnosis safe (3x) (F)
6. deploy gnosis safe (F)
7. deploy token (F)
8. -> Flow 3

### OdentityFlow 3 (Profil)

1. name
   ->
2. Lastname
3. Image

### OdentityFlow 4 (Connect Circles SeedPhrase)

1. enter private key or seedphrase (from circles)
2. add private key to my odentity (F)

### Odentity Flow 5 (Add / remove Device / Owner)

1. Create PPK (F)
2. AddOwnerPPK to Safe (circlesCore) (F)
3. export PPK to new device (copy paste oder QR-code)

### Odentity Flow 6 (Add / remove Social Guardien to your odentity / social recovery)

1. get public key from Guardian
2. AddOwnerPPK to Safe (circlesCore) (F)
3. get name from Guardian profile
4. export PPK to new device (copy paste oder QR-code)

## OmoSafe

### SafeFlow 1 (Trust)

1. enter / search for SafeAddress
2. define limitPercentage in amount / not percentage
3. send
4. -> close Modal

### SafeFlow 2 (UnTrust)

1. define safeadresse to untrust
   -> close modal

### SafeFlow 3 (Transaction)

1. get my SafeOwner (F)
2. get my SafeAdress (F)
3. set safeAddress of Recipient
4. set Amount
5. send

### OrgaFlow 2 (add metadata of orga)

1. set name
2. set location homebase ("string")

## Gruppe type: Dream Flows

### DreamFlow 1 (create new dream)

1. Welcome Slideshow
2. create new PPK (F)
3. create gnosis safe (F)
4. giveTrust gnosis safe (3x) (F)
5. deploy gnosis safe (F)
6. deploy token (F)
7. -> Flow 2

### DreamFlow 2 (add metadata to dream)

1. set dream name
2. define dream
3. set location homebase ("string")
4. -> Hightlight Chat

### DreamFlow 3 (fibonnacci 1-5 - Leap 1)

1. Commit yourself min 12h a week
2. Find 1 co-creator with min 12h week
3. find 2 more co-creators who commit min 6 hours a week
4. Find 3 more co-creators who commit min 4 hours a week
5. Find 5 more co-creators who commit min 2 hours a week

### DreamFlow 4 (fibonnacci 6-10 - Leap 2 - vote and save slot)

1. +8 100% discount vote
2. +13 90% discount vote
3. +21 80% discount vote
4. +34 70% discount vote
5. +55 60% discount vote

### DreamFlow 5 (fibonnacci 11-15 - Leap 3)

1. +89 start pre-order stream 50% discount
2. +144 33% pre-order discount
3. +233 220% pre-order discount
4. +377 12.5% pre-order discount
5. +610 6.75% pre-order discount

### DreamFlow 6 (fibonnacci 16-20 - Leap 4)

1. +987 - 33% rebuy discount impact investor
2. +1597 - 20% rebuy disocunt
3. +2584 - 12.5% rebuy disocunt
4. +4181 - 7.69% rebuy disocunt
5. +6765 - 4.76% rebuy disocunt

## Chat Flows

### ChatFlow 1 (create new room)

1. Set name for room

### ChatFlow 2 (invite members to room)

2. Send invitation mail || autocomplete existing trusted contact

### ChatFlow 3 (send message)

3. Send new Message
