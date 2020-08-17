<script lang="ts">
    import {Manifest} from "../../interfaces/manifest"

    export const manifests:Manifest = [{
        type: "initial",

        /*
        Example:
        Imagine a "Navigate" action, that requires a string-property named "route".
        The button should send an event of this type to let the user change the current page.
         */
        properties: [{
            name: "parameterizedActionId",
            schema: "string",
            description: "Specifies the pre-filled action that should be sent by the button.",
            isOptional: false
        }]
    }];
</script>

<a href={data.action}
   class="text-center w-full text-white bg-tertiary py-2 px-4 uppercase
text-lg font-bold rounded-b hover:bg-secondary">
  {data.button}
</a>
