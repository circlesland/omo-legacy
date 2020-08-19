import { ISideEffect } from "../../../core/Flows/ISideEffect";
import { IProcessContext } from "../../../core/Flows/IProcessContext";
import { Omosapiens } from "../../../queries/omo/odentity/omosapiens";

export const inviteToDream: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.inviteToDream",
  inputs: [
    {
      name: "invitee",
      type: "schema:omo.string"
    }, {
      name: "email",
      type: "schema:omo.string"
    }, {
      name: "text",
      type: "schema:omo.any"
    }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) => {
    const invitee = context.local.inputs["invitee"];
    const email = context.local.inputs["email"];
    const text = context.local.inputs["text"];
    const dreamId = context.local.inputs["dreamId"];
    if (window.o.odentity.current == null) return;
    const inviter = await lookupName(window.o.odentity.current._id);
    let queryResult = await window.o.graphQL.query(`DreamById(_id:"${dreamId}"){name description}`);
    if (queryResult.data == null) return;
    const dream = queryResult.data.DreamById;
    window['Email'].send({
      Host: process.env.SMTPHOST,
      Username: process.env.SMTPUSER,
      Password: process.env.SMTPPASSWORD,
      To: email,
      From: 'team@omo.earth',
      Subject: `${inviter} wants to share a dream with you`,
      Body: `
      <p>Hey ${invitee},</p>
      <br>
      <p>${inviter} want to share a dream with you via omo.funding. The dream is named:</p>
      <h1>${dream.name}</h1>
      <p>${dream.description}</p>
      <br>
      <br>
      <br>
      <p>Personal message of ${inviter}</p>
      <p>${text}</p>
      <br>
      <br>
      <br>
      <p>omo.funding is Bavaria ipsum dolor sit amet Griasnoggalsubbm Schneid wuid Schdarmbeaga See Musi a fescha Bua glei om auf’n Gipfe. Zwedschgndadschi Gidarn in da greana Au kummd a vui Mamalad, wolpern und glei wirds no fui lustiga nackata. Hallelujah sog i, luja nackata middn Leonhardifahrt Kuaschwanz i Foidweg ded, oamoi? Obandln Resi ognudelt a ganze, Bradwurschtsemmal om auf’n Gipfe mogsd a Bussal. Da, hog di hi wiavui fensdaln Hemad boarischer so da i da Biaschlegl, gor. Bradwurschtsemmal Maibam Brotzeit abfieseln Schdarmbeaga See Spuiratz, Hemad. Ognudelt wolpern großherzig Foidweg Spezi sog i hoid Semmlkneedl sog i wos. Spernzaln Bladl dahoam gor hob Graudwiggal nomoi a so a Schmarn naa do? Noch da Giasinga Heiwog fias oa Weiznglasl wuid i hob di liab, pfiad de.</p>
      <p>you can see a short introduction on:<a href="youtube.com">video link</a></p>
      <br>
      <br>
      <br>
      <p>Please help ${inviter}'s dream to become true</p>
      <p>Kindly</p>
      <br>
      <p>mama omo</p>
      <br>
      <svg width="250" height="250" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M315.077 323.283L369.886 378.668L249.854 499.961L195.046 444.576L315.077 323.283Z" fill="#2AD78B"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M184.599 323.022L239.408 378.407L157.377 461.301C144.06 460.185 132.33 454.486 122.185 444.204C112.041 433.922 105.502 421.159 102.568 405.916L184.599 323.022Z" fill="#2AD78B"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M129.936 378.407L184.745 323.022L304.776 444.315L249.967 499.7L129.936 378.407Z" fill="#2AD78B"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M260.155 378.668L314.964 323.283L397.36 406.545C396.449 423.388 391.242 436.612 381.738 446.215C372.234 455.819 359.172 461.057 342.551 461.93L260.155 378.668Z" fill="#2AD78B"/>
        <path d="M250.5 290C293.302 290 328 255.302 328 212.5C328 169.698 293.302 135 250.5 135C207.698 135 173 169.698 173 212.5C173 255.302 207.698 290 250.5 290Z" fill="#C8D1E0"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M250 0C363.771 0 456 93.0975 456 207.939C456 265.363 432.94 317.351 395.657 354.981L340.769 299.227C363.791 275.829 378.019 243.579 378.019 207.971C378.019 136.502 320.703 78.564 250 78.564C179.297 78.564 121.981 136.502 121.981 207.971C121.981 243.589 136.216 275.846 159.25 299.245L104.362 355C67.0679 317.368 44 265.373 44 207.939C44 93.0975 136.229 0 250 0Z" fill="#0F1758"/>
      </svg>
      `
    }).then(
      message => console.log("MAIL", message)
    )
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};

async function lookupName(odentityId) {
  const omosapien = await Omosapiens.byOdentityId(odentityId);
  if (!omosapien || omosapien.length === 0) return odentityId;
  else return omosapien.name;
}