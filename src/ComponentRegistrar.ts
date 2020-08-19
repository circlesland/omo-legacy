//
// Quanta
//
import OmoDream from "./quants/2-molecules/OmoDream.svelte";
import OmoTitleBar from "./quants/2-molecules/OmoTitleBar.svelte";
import ActionsList from "./quants/2-molecules/ActionsList.svelte";
import OmoBanner from "./quants/2-molecules/OmoBanner.svelte";
import OmoLogin from "./quants/2-molecules/OmoLogin.svelte";
import OmoIntro from "./quants/2-molecules/OmoIntro.svelte";
import OmoChat from "./quants/2-molecules/OmoChat.svelte";
import OmoDreamChat from "./quants/2-molecules/OmoDreamChat.svelte";
import OmoNext from "./quants/2-molecules/OmoNext.svelte";
import OmoHero from "./quants/2-molecules/OmoHero.svelte";
import OmoGridDreams from "./quants/2-molecules/OmoGridDreams.svelte";
import OmoCircles from "./quants/2-molecules/OmoCircles.svelte";
import OmoCirclesBalance from "./quants/2-molecules/OmoCirclesBalance.svelte";
import OmoNavBottom from "./quants/2-molecules/OmoNavBottom.svelte";
import OmoNavTop from "./quants/2-molecules/OmoNavTop.svelte";
import OmoNavbar from "./quants/2-molecules/OmoNavbar.svelte";
import OmoDappsGrid from "./quants/2-molecules/OmoDappsGrid.svelte";
import OmoDapps from "./quants/2-molecules/OmoDapps.svelte";
import OmoDialogSteps from "./quants/2-molecules/OmoDialogSteps.svelte";
import OmoInput from "./quants/2-molecules/OmoInput.svelte";
import OmoStatusResponse from "./quants/2-molecules/OmoStatusResponse.svelte";
import OmoSelect from "./quants/2-molecules/OmoSelect.svelte";
import OmoGridVoting from "./quants/2-molecules/OmoGridVoting.svelte";
import OmoGridPreOrders from "./quants/2-molecules/OmoGridPreOrders.svelte";
import OmoGridProducts from "./quants/2-molecules/OmoGridProducts.svelte";
import OmoNextButton from "./quants/2-molecules/OmoNextButton.svelte";
import OmoAside from "./quants/2-molecules/OmoAside.svelte";
import OmoProfilePage from "./quants/2-molecules/OmoProfilePage.svelte";
import OmoProfile from "./quants/2-molecules/OmoProfile.svelte";
import OmoLoading from "./quants/2-molecules/OmoLoading.svelte";

//
// Flows
//
import { giveTrust as giveTrustFlow } from "./flows/omo/safe/giveTrust";
import { revokeTrust as revokeTrustFlow } from "./flows/omo/safe/revokeTrust";
import { transferCircles as transferCirclesFlow } from "./flows/omo/safe/transferCircles";
import { addChatRoom as addChatRoomFlow } from "./flows/omo/chat/addChatRoom";
import { removeChatRoom as removeChatRoomFlow } from "./flows/omo/chat/removeChatRoom";
import { sendMessage as sendMessageFlow } from "./flows/omo/chat/sendMessage";
import { addOwnerDevice as addOwnerDeviceFlow } from "./flows/omo/odentity/addOwnerDevice";
import { removeOwnerDevice as removeOwnerDeviceFlow } from "./flows/omo/odentity/removeOwnerDevice";
import { addAuthProviderMail as addAuthProviderMailFlow } from "./flows/omo/odentity/addAuthProviderMail";
import { removeAuthProviderMail as removeAuthProviderMailFlow } from "./flows/omo/odentity/removeAuthProviderMail";
import { addAuthProviderSeedPhrase as addAuthProviderSeedPhraseFlow } from "./flows/omo/odentity/addAuthProviderSeedPhrase";
import { removeAuthProviderSeedPhrase as removeAuthProviderSeedPhraseFlow } from "./flows/omo/odentity/removeAuthProviderSeedPhraseFlow";
import { createDream as createDreamFlow } from "./flows/omo/dreams/createDream";
import { createOmosapien as createOmosapienFlow } from "./flows/omo/odentity/createOmosapien";
import { createOmosapienNameOnly as createOmosapienNameOnlyFlow } from "./flows/omo/odentity/createOmosapienNameOnly";
//import { convertToProduct as convertToProductFlow } from "./flows/omo/dreams/convertToProduct";
import { startCampaign as startCampaignFlow } from "./flows/omo/dreams/startCampaign";
import { inviteToDream as inviteToDreamFlow } from "./flows/omo/dreams/inviteToDream";
import { addReservation as addReservationFlow } from "./flows/omo/dreams/addReservation";
import { addSubscription as addSubscriptionFlow } from "./flows/omo/dreams/addSubscription";
import { addCommitment as addCommitmentFlow } from "./flows/omo/dreams/addCommitment";
import { buyTokens as buyTokensFlow } from "./flows/omo/dreams/buyTokens";

//
// SideEffects
//
import { collectStepResult } from "./sideEffects/omo/shell/collectStepResult";
import { navigate as navigateSideEffect } from "./sideEffects/omo/shell/navigate";
import { giveTrust as giveTrustSideEffect } from "./sideEffects/omo/safe/giveTrust";
import { transferCircles as transferCirclesSideEffect } from "./sideEffects/omo/safe/transferCircles";
import { transferCircles as transferCirclesDreamSideEffect } from "./sideEffects/omo/dreams/transferCircles";
import { revokeTrust as revokeTrustSideEffect } from "./sideEffects/omo/safe/revokeTrust";
import { generatePpk as generatePpkSideEffect } from "./sideEffects/omo/web3/generatePpk";
import { generateSafe as generateSafeSideEffect } from "./sideEffects/omo/circles/generateSafe";
import { giveInitialTrust as giveInitialTrustSideEffect } from "./sideEffects/omo/circles/giveInitialTrust";
import { deployToken as deployTokenSideEffect } from "./sideEffects/omo/safe/deployToken";
import { deploySafe as deploySafeSideEffect } from "./sideEffects/omo/safe/deploySafe";
import { createDream as createDreamSideEffect } from "./sideEffects/omo/dreams/createDream";
import { revokeInitialTrust as revokeInitialTrustSideEffect } from "./sideEffects/omo/circles/revokeInitialTrust";
//import { convertToProduct as convertToProductSideEffect } from "./sideEffects/omo/dreams/convertToProduct";
import { startCampaign as startCampaignSideEffect } from "./sideEffects/omo/dreams/startCampaign";
import { inviteToDream as inviteToDreamSideEffect } from "./sideEffects/omo/dreams/inviteToDream";
import { createChatRoom as createChatRoomSideEffect } from "./sideEffects/omo/dreams/createChatRoom";
import { addReservation as addReservationSideEffect } from "./sideEffects/omo/dreams/addReservation";
import { addSubscription as addSubscriptionSideEffect } from "./sideEffects/omo/dreams/addSubscription";
import { createOmosapien as createOmosapienSideEffect } from "./sideEffects/omo/odentity/createOmosapien";
import { connectSafe as connectSafeSideEffect } from "./sideEffects/omo/odentity/connectSafe";
import { buyTokens as buyTokensSideEffect } from "./sideEffects/omo/dreams/buyTokens";
import { addCommitment as addCommitmentSideEffect } from "./sideEffects/omo/dreams/addCommitment";
import { checkAuthentification as checkAuthentificationSideEffect } from "./sideEffects/omo/dreams/checkAuthentification";

//
// Schema
//
import { ChatRoom } from "./schema/omo/chatRoom";
import { Event } from "./schema/omo/event";
import { LoginRequest } from "./schema/omo/loginRequest";
import { Message } from "./schema/omo/message";
import { Odentity } from "./schema/omo/odentity";
import { OdentityProvider } from "./schema/omo/odentityProvider";
import { Quant } from "./schema/omo/quant";
import { Safe } from "./schema/omo/safe/safe";
import { Number } from "./schema/omo/number";
import { Void } from "./schema/omo/void";
import { Any } from "./schema/omo/any";


export function init() {
  const w = <any>window;
  w.registrar = new Map();
  w.registrar.set("OmoHero", OmoHero);
  w.registrar.set("OmoTitleBar", OmoTitleBar);
  w.registrar.set("OmoDapps", OmoDapps);
  w.registrar.set("OmoBanner", OmoBanner);
  w.registrar.set("OmoLogin", OmoLogin);
  w.registrar.set("OmoIntro", OmoIntro);
  w.registrar.set("OmoChat", OmoChat);
  w.registrar.set("OmoDreamChat", OmoDreamChat);
  w.registrar.set("OmoDream", OmoDream);
  w.registrar.set("OmoGridDreams", OmoGridDreams);
  w.registrar.set("OmoDappsGrid", OmoDappsGrid);
  w.registrar.set("OmoNext", OmoNext);
  w.registrar.set("OmoCircles", OmoCircles);
  w.registrar.set("OmoCirclesBalance", OmoCirclesBalance);
  w.registrar.set("OmoNavBottom", OmoNavBottom);
  w.registrar.set("OmoNavTop", OmoNavTop);
  w.registrar.set("OmoNavbar", OmoNavbar);
  w.registrar.set("ActionsList", ActionsList);
  w.registrar.set("OmoDialogSteps", OmoDialogSteps);
  w.registrar.set("OmoInput", OmoInput);
  w.registrar.set("OmoStatusResponse", OmoStatusResponse);
  w.registrar.set("OmoGridVoting", OmoGridVoting);
  w.registrar.set("OmoGridPreOrders", OmoGridPreOrders);
  w.registrar.set("OmoGridProducts", OmoGridProducts);
  w.registrar.set("OmoSelect", OmoSelect);
  w.registrar.set("OmoNextButton", OmoNextButton);
  w.registrar.set("OmoLoading", OmoLoading);
  w.registrar.set("OmoProfilePage", OmoProfilePage);
  w.registrar.set("OmoAside", OmoAside);
  w.registrar.set("OmoProfile", OmoProfile);

  w.flowRegistrar = new Map();
  w.flowRegistrar.set("flows:omo.safe.giveTrust", giveTrustFlow);
  w.flowRegistrar.set("flows:omo.safe.revokeTrust", revokeTrustFlow);
  w.flowRegistrar.set("flows:omo.safe.transferCircles", transferCirclesFlow);
  w.flowRegistrar.set("flows:omo.chat.addChatRoom", addChatRoomFlow);
  w.flowRegistrar.set("flows:omo.chat.removeChatRoom", removeChatRoomFlow);
  w.flowRegistrar.set("flows:omo.chat.sendMessage", sendMessageFlow);
  w.flowRegistrar.set("flows:omo.odentity.addOwnerDevice", addOwnerDeviceFlow);
  w.flowRegistrar.set(
    "flows:omo.odentity.removeOwnerDevice",
    removeOwnerDeviceFlow
  );
  w.flowRegistrar.set(
    "flows:omo.odentity.addAuthProviderMail",
    addAuthProviderMailFlow
  );
  w.flowRegistrar.set(
    "flows:omo.odentity.removeAuthProviderMail",
    removeAuthProviderMailFlow
  );
  w.flowRegistrar.set(
    "flows:omo.odentity.addAuthProviderSeedPhrase",
    addAuthProviderSeedPhraseFlow
  );
  w.flowRegistrar.set(
    "flows:omo.odentity.removeAuthProviderSeedPhrase",
    removeAuthProviderSeedPhraseFlow
  );
  w.flowRegistrar.set("flows:omo.dreams.createDream", createDreamFlow);
  w.flowRegistrar.set(
    "flows:omo.odentity.createOmosapien",
    createOmosapienFlow
  );
  w.flowRegistrar.set(
    "flows:omo.odentity.createOmosapienNameOnly",
    createOmosapienNameOnlyFlow
  );
  /*
  w.flowRegistrar.set(
    "flows:omo.dreams.convertToProduct",
    convertToProductFlow
  );
   */
  w.flowRegistrar.set(
    "flows:omo.dreams.startCampaign",
    startCampaignFlow
  );
  w.flowRegistrar.set(
    "flows:omo.dreams.inviteToDream",
    inviteToDreamFlow
  );
  w.flowRegistrar.set(
    "flows:omo.dreams.addReservation",
    addReservationFlow
  );
  w.flowRegistrar.set(
    "flows:omo.dreams.addSubscription",
    addSubscriptionFlow
  );
  w.flowRegistrar.set(
    "flows:omo.dreams.addCommitment",
    addCommitmentFlow
  );
  w.flowRegistrar.set(
    "flows:omo.dreams.buyTokens",
    buyTokensFlow
  );

  w.sideEffectRegistrar = new Map();
  [
    collectStepResult,
    navigateSideEffect,
    giveTrustSideEffect,
    revokeTrustSideEffect,
    transferCirclesSideEffect,
    generatePpkSideEffect,
    generateSafeSideEffect,
    giveInitialTrustSideEffect,
    deployTokenSideEffect,
    deploySafeSideEffect,
    createDreamSideEffect,
    revokeInitialTrustSideEffect,
    createOmosapienSideEffect,
    connectSafeSideEffect,
    startCampaignSideEffect,
    //convertToProductSideEffect,
    inviteToDreamSideEffect,
    createChatRoomSideEffect,
    addReservationSideEffect,
    addSubscriptionSideEffect,
    addCommitmentSideEffect,
    buyTokensSideEffect,
    transferCirclesDreamSideEffect,
    checkAuthentificationSideEffect
  ].forEach((o) => {
    w.sideEffectRegistrar.set(o["_$schemaId"], o);
  });

  w.schemaRegistrar = new Map();
  [
    ChatRoom,
    Event,
    LoginRequest,
    Message,
    Odentity,
    OdentityProvider,
    Quant,
    Safe,
    Number,
    Void,
    Any,
  ].forEach((o) => {
    w.schemaRegistrar.set(o["_$schemaId"], o);
  });
}
