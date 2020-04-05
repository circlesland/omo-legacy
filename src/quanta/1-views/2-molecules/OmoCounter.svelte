<script>
  import { writable } from "svelte/store";
  const count = writable(0);

  let action = {
    countUp() {
      model.propose({ inc: 1 });
    }
  };

  let model = {
    count: 0,
    propose(action) {
      this.count += action.inc > 0 ? action.inc : 0;
      state.learn(this);
    }
  };

  let state = {
    learn(model) {
      count.update(model.count);
    }
  };
</script>

<button class="w-1/5 py-1 px-3 bg-ci-2 omo-border" on:click={action.countUp}>
  countUp
</button>
<p class="text-xl">{count}</p>
