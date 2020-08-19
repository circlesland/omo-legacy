<script context="module">
  export function changeColor() {
    alert("changed color");
  }

  export function nextStep(step) {
    var s = step + 1;
    return {
      step: s,
      title: switchStep(step).title,
      subline: switchStep(step).subline,
      button: switchStep(step).button
    };
  }

  function switchStep(step) {
    switch (step) {
      case 0:
        return {
          title:
                  "I am MamaOmo and I am your Co-Captain on your intergalactic journey through your life dreams",
          button: "next"
        };
        break;

      case 1:
        return {
          title:
                  "First, let's find you a new home planet from where you will start to explore your universe",
          button: "next"
        };
        break;

      case 2:
        return {
          title:
                  "Well done, you just landed your OmoDream Rocket on your personal planet",
          button: "next"
        };
        break;

      case 3:
        return {
          title:
                  "Your planet is still very grey, cold and lonely. Let me show you how to introduce some color",
          button: "next"
        };
        break;

      case 4:
        return {
          title:
                  "First of all, you are the captain and in charge of bringing your own planet to life and keep it nice and tidy",
          subline:
                  "everything you will grow, build and store on your planet is 100% under your control",
          button: "next"
        };
        break;
      case 5:
        return {
          title:
                  "For now your planet is living in a parallel universe and can only be seen and visited by you",
          subline:
                  "in technical terms all your data is encrypted, offline first and owned only by you",
          button: "next"
        };
        break;

      case 6:
        return {
          title: "Time to get your hands dirty and to plant some life here",
          button: "next"
        };
        break;

      case 7:
        return {
          title: "more coming soom",
          subline: "getting tired now",
          button: "next"
        };
        break;

      default:
        navigate("omodreams");
    }
  }
</script>
