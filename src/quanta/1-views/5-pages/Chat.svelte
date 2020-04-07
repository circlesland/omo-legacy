<script>
  import Eliza from "elizabot";
  import { beforeUpdate, afterUpdate } from "svelte";
  let chat = [
    "Hi schön das du an diesem tollen Projekt interessiert bist, ich heiße James und wie heißt du?",
    "Cool, woher kommst du denn?",
    "Möchtest du einen Opa kennenlernen, oder möchtest du dich oder einen deiner Bewohner registrieren?",
    "Das ist ja Klasse, wir werden bestimmt den richtigen Enkel für dich finden. Bitte sage mir zuerst in welcher Kategorie du dich registrieren möchtest. Ich hätte folgende zur Auswahl: " +
      "1-Persönliches treffen 2-Reden (Telefon/Internet) 3-Schreiben (Briefe, Emails, etc.) 4-Unternehmungen",
    "Cool, du möchtest also etwas unternehmen. Bist du denn sonst auch so aktiv?",
    "Das ist ja interessant, ich merke schon dein 'Enkel' wird sicher viel Spaß mit dir haben. An was für Unterehmungen hast du Spaß? Eher sportlich oder eher ruhig?",
    "Klasse. Was hast du denn sonst für Interessen und Hobbies?",
    "Gibt es auch Dinge mit denen du Schwierigkeiten hast?",
    "Das klingt ja garnicht so schlimm. Woher kommst du denn?",
    "Cool, in Memmingen haben wir eine große Gemeinschaft und einen aktiven Blog, da findest du bestimmt schnell jemanden. Was sind den deine 3 größten Wünsche die du noch hast, oder bist du wunschlos glücklick?",
    "Danke Peter, jetzt haben wir schon fast alles, ich würde dich gerne registrieren. Wie möchtest du dich in Zukunft anmelden? 1-Ich kann dir eine Email senden 2-Über ein soziales Netzwerk 3-klassisch mit Passwort 4-Per SMS oder InstantMessenger",
    "Klasse! Damit ich dir eine Email senden kann brauche ich noch deine Email Adresse",
    "Vielen Dank Peter, danke das du dich registriert hast. Um sicher zu stellen das du eine echte Person bist, wird sich Mitarbeiter diesen Chatverlauf ansehen und dich ggf. Noch einmal anschreiben. Bis dein Konto verifiziert ist kannst du dich gerne hier umsehen und",
    "zum Beispiel den Blog deiner Stadt lesen. Vielen Dank für das tolle Gespräch!"
  ];
  let div;
  let autoscroll;

  beforeUpdate(() => {
    autoscroll =
      div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll) div.scrollTo(0, div.scrollHeight);
  });

  const eliza = new Eliza();
  let i = 0;
  let comments = [{ author: "eliza", text: chat[i++] }];
  function handleKeydown(event) {
    if (event.which === 13) {
      const text = event.target.value;
      if (!text) return;

      comments = comments.concat({
        author: "user",
        text
      });

      event.target.value = "";

      // const reply = eliza.transform(text);
      const reply = chat[i++];

      setTimeout(() => {
        comments = comments.concat({
          author: "eliza",
          text: "...",
          placeholder: true
        });

        setTimeout(() => {
          comments = comments
            .filter(comment => !comment.placeholder)
            .concat({
              author: "eliza",
              text: reply
            });
        }, 500 + Math.random() * 500);
      }, 200 + Math.random() * 200);
    }
  }
</script>

<style>
  .left {
    align-self: flex-start;
  }
</style>

<div class="flex flex-1 justify-center " style="height:calc('100%-100px')">
  <div class="w-5/6 xl:w-4/6">
    <div
      class="scrollable"
      style="display:flex;flex-direction:column;align-items:flex-end;"
      bind:this={div}>
      {#each comments as comment}
        <article class="m-1 " class:left={comment.author != ''}>
          <span
            class="text-ci text-xl p-2 text-lg rounded"
            style="font-family: 'Indie Flower'!important;"
            class:text-ci-2={comment.author === 'eliza'}>
            {comment.text}
          </span>
        </article>
      {/each}
    </div>

  </div>
</div>
<footer
  class="w-full text-center border-t border-grey bg-gray-300 p-4 sticky bottom-0">
  <div class="flex flex-wrap -mx-3 justify-center">
    <div class="w-5/6 xl:w-4/6 px-3">
      <input
        on:keydown={handleKeydown}
        class="block w-full text-gray-700 border border-gray-500 rounded py-2
        px-4 leading-tight focus:outline-none focus:bg-white
        focus:border-gray-500"
        id="chat-text"
        type="text"
        placeholder="Gebe hier deine Antwort ein"
        style="font-family: 'Indie Flower'!important;" />
    </div>
  </div>
</footer>
