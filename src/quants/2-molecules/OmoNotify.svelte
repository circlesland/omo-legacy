<script>
  import moment from "moment";

  // open-close state
  let show = false;

  let notifications = [];

  async function updateAsync() {
    const PAGE_SIZE = 100;

    if (window.o.odentity.current) {
      // Get list of my activities
      const addr = window.o.web3.utils.toChecksumAddress(
              window.o.odentity.current.circleSafe.safeAddress.trim()
      );
      const {activities} = await window.o.circlesCore.activity.getLatest(
              window.o.odentity.current.circleSafeOwner,
              {
                safeAddress: addr
              },
              PAGE_SIZE,
              0,
              0
      );

      // Example: Display activities
      const {ActivityTypes} = window.o.circlesCore.activity;

      activities.forEach(activity => {
        const {timestamp, type, data} = activity;

        let text = "";
        let title = "";
        let tag = "";

        if (type === ActivityTypes.HUB_TRANSFER) {
          text = `transferred ${(
                  data.value.toString() / 1000000000000000000
          ).toFixed(2)} Circles to ${data.to}`;
          title = `Send ${(data.value.toString() / 1000000000000000000).toFixed(
                  2
          )}`;
          tag = "TRANSFER";
        } else if (type === ActivityTypes.ADD_CONNECTION) {
          text = `${data.canSendTo} allowed ${data.user} to transfer Circles`;
          title = `Added ${data.limitPercentage}% trust`;
          tag = "TRUST";
        } else if (type === ActivityTypes.REMOVE_CONNECTION) {
          text = `${data.canSendTo} untrusted ${data.user}`;
          title = `Removed ${data.limitPercentage}% trust`;
          tag = "TRUST";
        } else if (type === ActivityTypes.ADD_OWNER) {
          text = `added ${data.ownerAddress} to ${data.safeAddress}`;
          title = `Added SafeOwner`;
          tag = "OWNERCHANGE";
        } else if (type === ActivityTypes.REMOVE_OWNER) {
          text = `removed ${data.ownerAddress} from ${data.safeAddress}`;
          title = `Removed SafeOwner`;
          tag = "OWNERCHANGE";
        }

        notifications = [
          ...notifications,
          {
            date: timestamp,
            title: title,
            text: text,
            tag: tag
          }
        ];
      });
    }
  }

  updateAsync();
</script>

<style>
  /* unread message count */
  .badge {
    display: inline-block;
    position: absolute;
    top: 0;
    background-color: #1c8fc0;
    color: #d7e6fd;
    right: 0;
    border-radius: 9999px;
    font-size: 12px;
    min-width: 18px;
    line-height: 18px;
    min-height: 18px;
    text-align: center;
  }

  ul {
    height: 80vh;
  }
</style>

<!-- notification center -->
<button class="relative p-1" on:click={() => (show = !show)}>
  <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-6 h-6">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
  <span class="badge">2</span>
</button>

<!-- show only if true -->
{#if show}
  <!-- clicking anywhere on the page will close the popup -->
  <button
          tabindex="-1"
          class="fixed inset-0 w-full h-full cursor-default "
          on:click|preventDefault={() => (show = !show)}/>
  <div
          class="absolute right-0 mt-2 text-primary rounded messages overflow-hidden
    h-screen">
    <ul class="px-3 space-y-3 overflow-y-scroll">
      {#each notifications as item}
        {#if item.tag == 'TRANSFER'}
          <div class="flex w-sm mb-4 bg-white">
            <div class="w-16 bg-green-400">
              <div class="p-4">
                <svg
                        class="h-8 w-8 text-white fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512">
                  <path
                          d="M503.191 381.957c-.055-.096-.111-.19-.168-.286L312.267
                    63.218l-.059-.098c-9.104-15.01-23.51-25.577-40.561-29.752-17.053-4.178-34.709-1.461-49.72
                    7.644a66 66 0 0 0-22.108 22.109l-.058.097L9.004
                    381.669c-.057.096-.113.191-.168.287-8.779 15.203-11.112
                    32.915-6.569 49.872 4.543 16.958 15.416 31.131 30.62
                    39.91a65.88 65.88 0 0 0 32.143
                    8.804l.228.001h381.513l.227.001c36.237-.399 65.395-30.205
                    64.997-66.444a65.86 65.86 0 0 0-8.804-32.143zm-56.552
                    57.224H65.389a24.397 24.397 0 0
                    1-11.82-3.263c-5.635-3.253-9.665-8.507-11.349-14.792a24.196
                    24.196 0 0 1 2.365-18.364L235.211 84.53a24.453 24.453 0 0 1
                    8.169-8.154c5.564-3.374 12.11-4.381 18.429-2.833 6.305 1.544
                    11.633 5.444 15.009 10.986L467.44 402.76a24.402 24.402 0 0 1
                    3.194 11.793c.149 13.401-10.608 24.428-23.995 24.628z"/>
                  <path
                          d="M256.013 168.924c-11.422 0-20.681 9.26-20.681
                    20.681v90.085c0 11.423 9.26 20.681 20.681 20.681 11.423 0
                    20.681-9.259
                    20.681-20.681v-90.085c.001-11.421-9.258-20.681-20.681-20.681zM270.635
                    355.151c-3.843-3.851-9.173-6.057-14.624-6.057a20.831 20.831
                    0 0 0-14.624 6.057c-3.842 3.851-6.057 9.182-6.057 14.624 0
                    5.452 2.215 10.774 6.057 14.624a20.822 20.822 0 0 0 14.624
                    6.057c5.45 0 10.772-2.206 14.624-6.057a20.806 20.806 0 0 0
                    6.057-14.624 20.83 20.83 0 0 0-6.057-14.624z"/>
                </svg>
              </div>
            </div>
            <div class="w-auto text-grey-darker items-center p-4">
              <span class="text-lg font-bold pb-4">{item.title}</span>
              <p class="leading-tight">{item.text}</p>
              {moment
              .unix(item.date)
              .locale('en')
              .fromNow()}
            </div>
          </div>
        {/if}
        {#if item.tag == 'TRUST'}
          <div class="flex w-sm mb-4 bg-white">
            <div class="w-16 bg-blue-400">
              <div class="p-4">
                <svg
                        class="h-8 w-8 text-white fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512">
                  <path
                          d="M503.191 381.957c-.055-.096-.111-.19-.168-.286L312.267
                    63.218l-.059-.098c-9.104-15.01-23.51-25.577-40.561-29.752-17.053-4.178-34.709-1.461-49.72
                    7.644a66 66 0 0 0-22.108 22.109l-.058.097L9.004
                    381.669c-.057.096-.113.191-.168.287-8.779 15.203-11.112
                    32.915-6.569 49.872 4.543 16.958 15.416 31.131 30.62
                    39.91a65.88 65.88 0 0 0 32.143
                    8.804l.228.001h381.513l.227.001c36.237-.399 65.395-30.205
                    64.997-66.444a65.86 65.86 0 0 0-8.804-32.143zm-56.552
                    57.224H65.389a24.397 24.397 0 0
                    1-11.82-3.263c-5.635-3.253-9.665-8.507-11.349-14.792a24.196
                    24.196 0 0 1 2.365-18.364L235.211 84.53a24.453 24.453 0 0 1
                    8.169-8.154c5.564-3.374 12.11-4.381 18.429-2.833 6.305 1.544
                    11.633 5.444 15.009 10.986L467.44 402.76a24.402 24.402 0 0 1
                    3.194 11.793c.149 13.401-10.608 24.428-23.995 24.628z"/>
                  <path
                          d="M256.013 168.924c-11.422 0-20.681 9.26-20.681
                    20.681v90.085c0 11.423 9.26 20.681 20.681 20.681 11.423 0
                    20.681-9.259
                    20.681-20.681v-90.085c.001-11.421-9.258-20.681-20.681-20.681zM270.635
                    355.151c-3.843-3.851-9.173-6.057-14.624-6.057a20.831 20.831
                    0 0 0-14.624 6.057c-3.842 3.851-6.057 9.182-6.057 14.624 0
                    5.452 2.215 10.774 6.057 14.624a20.822 20.822 0 0 0 14.624
                    6.057c5.45 0 10.772-2.206 14.624-6.057a20.806 20.806 0 0 0
                    6.057-14.624 20.83 20.83 0 0 0-6.057-14.624z"/>
                </svg>
              </div>
            </div>
            <div class="w-auto text-grey-darker items-center p-4">
              <span class="text-lg font-bold pb-4">{item.title}</span>
              <p class="leading-tight">{item.text}</p>
              {moment
              .unix(item.date)
              .locale('en')
              .fromNow()}
            </div>
          </div>
        {/if}
        {#if item.tag == 'OWNERCHANGE'}
          <div class="flex w-sm mb-4 bg-white">
            <div class="w-16 bg-red-400">
              <div class="p-4">
                <svg
                        class="h-8 w-8 text-white fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512">
                  <path
                          d="M503.191 381.957c-.055-.096-.111-.19-.168-.286L312.267
                    63.218l-.059-.098c-9.104-15.01-23.51-25.577-40.561-29.752-17.053-4.178-34.709-1.461-49.72
                    7.644a66 66 0 0 0-22.108 22.109l-.058.097L9.004
                    381.669c-.057.096-.113.191-.168.287-8.779 15.203-11.112
                    32.915-6.569 49.872 4.543 16.958 15.416 31.131 30.62
                    39.91a65.88 65.88 0 0 0 32.143
                    8.804l.228.001h381.513l.227.001c36.237-.399 65.395-30.205
                    64.997-66.444a65.86 65.86 0 0 0-8.804-32.143zm-56.552
                    57.224H65.389a24.397 24.397 0 0
                    1-11.82-3.263c-5.635-3.253-9.665-8.507-11.349-14.792a24.196
                    24.196 0 0 1 2.365-18.364L235.211 84.53a24.453 24.453 0 0 1
                    8.169-8.154c5.564-3.374 12.11-4.381 18.429-2.833 6.305 1.544
                    11.633 5.444 15.009 10.986L467.44 402.76a24.402 24.402 0 0 1
                    3.194 11.793c.149 13.401-10.608 24.428-23.995 24.628z"/>
                  <path
                          d="M256.013 168.924c-11.422 0-20.681 9.26-20.681
                    20.681v90.085c0 11.423 9.26 20.681 20.681 20.681 11.423 0
                    20.681-9.259
                    20.681-20.681v-90.085c.001-11.421-9.258-20.681-20.681-20.681zM270.635
                    355.151c-3.843-3.851-9.173-6.057-14.624-6.057a20.831 20.831
                    0 0 0-14.624 6.057c-3.842 3.851-6.057 9.182-6.057 14.624 0
                    5.452 2.215 10.774 6.057 14.624a20.822 20.822 0 0 0 14.624
                    6.057c5.45 0 10.772-2.206 14.624-6.057a20.806 20.806 0 0 0
                    6.057-14.624 20.83 20.83 0 0 0-6.057-14.624z"/>
                </svg>
              </div>
            </div>
            <div class="w-auto text-grey-darker items-center p-4">
              <span class="text-lg font-bold pb-4">{item.title}</span>
              <p class="leading-tight">{item.text}</p>
              {moment
              .unix(item.date)
              .locale('en')
              .fromNow()}
            </div>
          </div>
        {/if}
      {/each}
    </ul>
  </div>
{/if}
