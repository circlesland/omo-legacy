<script>
  import { observe } from "svelte-observable";
  import { StartFlow } from "../../events/omo/shell/startFlow";
  import { Dreams as DreamsQueries } from "../../queries/omo/dreams/dreams";
  import { afterUpdate, beforeUpdate } from "svelte";
  import Observable from "zen-observable";

  import mocker from "mocker-data-generator";

  async function getMockedPeople() {
    const people = {
      name: {
        faker: "name.findName",
        unique: true,
      },
      image: {
        function: function () {
          return "https://source.unsplash.com/featured/?" + this.object.name;
        },
      },
    };

    return mocker()
      .schema("people", people, 3000)
      .build()
      .then(
        (data) => data.people,
        (err) => console.error(err)
      );
  }

  export let data;

  /**
   * The DIV container that contains all unlocked leaps and levels.
   */
  // let subscriptionListContainerDiv;

  // let autoscroll;

  // beforeUpdate(() => {
  //   autoscroll =
  //     subscriptionListContainerDiv &&
  //     subscriptionListContainerDiv.offsetHeight +
  //       subscriptionListContainerDiv.scrollTop >
  //       subscriptionListContainerDiv.scrollHeight - 20;
  // });

  // afterUpdate(() => {
  //   if (autoscroll)
  //     subscriptionListContainerDiv.scrollTo(
  //       0,
  //       subscriptionListContainerDiv.scrollHeight
  //     );
  // });

  let levelMetadatas = [
    {
      fromLevel: 0,
      toLevel: 6,
      subscriptionDiscount: 100,
      tokenDiscount: null,
    },
    {
      fromLevel: 7,
      toLevel: 7,
      subscriptionDiscount: 90,
      tokenDiscount: null,
    },
    {
      fromLevel: 8,
      toLevel: 8,
      subscriptionDiscount: 80,
      tokenDiscount: null,
    },
    {
      fromLevel: 9,
      toLevel: 9,
      subscriptionDiscount: 70,
      tokenDiscount: null,
    },
    {
      fromLevel: 10,
      toLevel: 10,
      subscriptionDiscount: 60,
      tokenDiscount: null,
    },
    {
      fromLevel: 11,
      toLevel: 11,
      subscriptionDiscount: 50,
      tokenDiscount: null,
    },
    {
      fromLevel: 12,
      toLevel: 12,
      subscriptionDiscount: 33.33,
      tokenDiscount: null,
    },
    {
      fromLevel: 13,
      toLevel: 13,
      subscriptionDiscount: 20,
      tokenDiscount: null,
    },
    {
      fromLevel: 14,
      toLevel: 14,
      subscriptionDiscount: 12.5,
      tokenDiscount: null,
    },
    {
      fromLevel: 15,
      toLevel: 15,
      subscriptionDiscount: 7.69,
      tokenDiscount: null,
    },
    {
      fromLevel: 16,
      toLevel: 16,
      subscriptionDiscount: 4.76,
      tokenDiscount: 33.33,
    },
    {
      fromLevel: 17,
      toLevel: 17,
      subscriptionDiscount: 2.94,
      tokenDiscount: 20,
    },
    {
      fromLevel: 18,
      toLevel: 18,
      subscriptionDiscount: 1.82,
      tokenDiscount: 12.5,
    },
    {
      fromLevel: 19,
      toLevel: 19,
      subscriptionDiscount: 1.12,
      tokenDiscount: 7.69,
    },
    {
      fromLevel: 20,
      toLevel: 20,
      subscriptionDiscount: 0.69,
      tokenDiscount: 4.78,
    },
    {
      fromLevel: 21,
      toLevel: 22,
      subscriptionDiscount: 0,
      tokenDiscount: 4.78,
    },
    {
      fromLevel: 22,
      toLevel: 999,
      subscriptionDiscount: 0,
      tokenDiscount: 0,
    },
  ];

  let leapMetadata = [
    {
      fromLeap: 0,
      toLeap: 1,
      title: "Time commitment",
      description: "",
      actionTitle: "Commit time",
      action: () =>
        window.o.publishShellEventAsync(
          new StartFlow("flows:omo.dreams.addCommitment", data.dream._id)
        ),
    },
    {
      fromLeap: 2,
      toLeap: 2,
      title: "Reservations",
      description: "",
      actionTitle: "Reservate",
      action: () =>
        window.o.publishShellEventAsync(
          new StartFlow("flows:omo.dreams.addReservation", data.dream._id)
        ),
    },
    {
      fromLeap: 3,
      toLeap: 999,
      title: "Subscription",
      actionTitle: "Subscribe",
      action: () =>
        window.o.publishShellEventAsync(
          new StartFlow("flows:omo.dreams.addSubscription", data.dream._id)
        ),
    },
    {
      fromLeap: 4,
      toLeap: 4,
      title: "Impact investors",
      description: "",
      actionTitle: "Buy tokens",
      action: () =>
        window.o.publishShellEventAsync(
          new StartFlow("flows:omo.dreams.buyTokens", data.dream._id)
        ),
    },
  ];

  function formatStreams(streams) {
    const subscriptions = [];

    let lastLevel = 0;
    let lastLeap = 0;

    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      const levelAndLeap = DreamsQueries.calcLevel(i);

      const level = levelMetadatas.find(
        (o) =>
          o.fromLevel <= levelAndLeap.level && o.toLevel >= levelAndLeap.level
      );

      const levelMetadata = {
        levelHeader:
          lastLevel !== levelAndLeap.level ? levelAndLeap.level : null,
        leapHeader: lastLeap !== levelAndLeap.leap ? levelAndLeap.leap : null,
        level: levelAndLeap.level,
        leap: levelAndLeap.leap,
        subscription: stream,
        subscriptionDiscount: !level.subscriptionDiscount
          ? ""
          : level.subscriptionDiscount,
        tokenDiscount: !level.tokenDiscount ? "" : level.tokenDiscount,
      };

      lastLeap = levelAndLeap.leap;
      lastLevel = levelAndLeap.level;

      subscriptions.push(levelMetadata);
    }

    const nextLevelAndLeap = DreamsQueries.calcLevel(streams.length);

    return {
      leaps: leapMetadata.filter(
        (o) =>
          o.fromLeap <= nextLevelAndLeap.leap &&
          o.toLeap >= nextLevelAndLeap.leap
      ),
      subscriptions: subscriptions,
    };
  }

  const streamObservable = new Observable((observer) => {
    window.o.graphQL
      .subscribe("Streams {_id Dream{_id}}")
      .subscribe((streams) => {
        console.log(".....Streams changed.....");
        const streamsOfDream = streams.data.Streams.filter(
          (o) => o.Dream && o.Dream._id == data.dream._id
        );
        const formatted = formatStreams(streamsOfDream);
        observer.next(formatted);
      });
  });

  const streams = observe(streamObservable);
</script>

<style>
  .aside-top {
    grid-area: aside-top;
    height: 100%;
  }
  .aside-bottom {
    grid-area: aside-bottom;
    height: 100%;
    overflow-y: scroll;
  }
</style>

{#await getMockedPeople() then mockedPeople}
  {#await $streams}
    loading..
  {:then data}
    <div class="aside-top text-md">
      <div class="bg-gray-300">
        <div class="flex flex-col justify-center h-16 text-center">
          <p
            class="py-2 px-4 text-xl font-bold text-primary h-full flex
            justify-center flex-col bg-gray-300 uppercase">
            [Benefit title]
          </p>
        </div>
        <div class="bg-gray-100">
          <p class="text-md p-6 text-gray-600">
            By joining the dream now, you will reservate your pre-order slot,
            which will give you x percent lifetime discount on using the future
            product service.
          </p>
        </div>
        <div class="flex">
          {#each data.leaps as leap}
            <p
              class=" text-md py-2 bg-tertiary hover:bg-secondary text-center
              text-white w-full uppercase font-bold cursor-pointer"
              on:click={leap.action}>
              {leap.actionTitle}
            </p>
          {/each}
        </div>
      </div>
    </div>
    <div class="aside-bottom pt-6">

      {#each data.subscriptions as reservation, i}
        {#if reservation.leapHeader}
          <p
            class="uppercase text-lg font-bold bg-gray-300 py-3 text-primary
            text-center">
            Leap {reservation.leapHeader}
          </p>
        {/if}
        {#if reservation.levelHeader}
          <p class="uppercase text-md font-bold text-gray-600">
            Level {reservation.levelHeader}
          </p>
        {/if}
        <div class="flex h-12 mb-4 w-full bg-gray-100">
          <img
            alt=""
            src="https://i.pravatar.cc/150?u={i}"
            class="h-full w-auto" />
          <p class="py-3 px-4 rounded w-full">
            {mockedPeople[i].name}
            {#if reservation.subscriptionDiscount > 0}
              ({reservation.subscriptionDiscount}%)
            {/if}
          </p>
        </div>
      {/each}
    </div>
  {/await}
{/await}
