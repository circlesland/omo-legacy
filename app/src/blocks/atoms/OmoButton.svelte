<script lang="ts">
    import {Manifest} from "../../interfaces/manifest"

    export const manifest:Manifest = {
      name: "OmoButton",

        properties: [{
            name: "parameterizedActionId",
            schema: "string",
            description: "Specifies the pre-filled action that should be sent by the button.",
            isOptional: false
        }]
    };

    export let data = {
      action: "",
      button: ""
    }
</script>

<a href={data.action}
   class="text-center w-full text-white bg-tertiary py-2 px-4 uppercase
text-lg font-bold rounded-b hover:bg-secondary">
  {data.button}
</a>
