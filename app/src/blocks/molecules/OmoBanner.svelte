<script lang="ts">

    import {Manifest} from "../../interfaces/manifest"

    export const manifest:Manifest = {
    };

    export let data = {
        title: "one quantum leap a time",
        image: "https://source.unsplash.com/random",
        action: "",
        button: "",
    };
</script>

<div
        class="bg-cover bg-center object-fill"
        style="background-image: url({data.image})">
    <div class="h-full flex flex-col justify-center">
        <div class="flex flex-wrap w-5/6 md:w-2/3 m-auto">
            <div
                    class="w-full text-center px-16 py-8 rounded-t"
                    style="background-color: rgba(11, 42, 77, 0.4);">
                <h1
                        class="uppercase text-tertiary omo-font-title text-4xl md:text-5xl
          lg:text-6xl">
                  {data.title}
                </h1>
            </div>
            <a
                    href={data.action}
                    class="text-center w-full text-white bg-tertiary py-2 px-4 uppercase
        text-lg font-bold rounded-b hover:bg-secondary">
              {data.button}
            </a>
        </div>
    </div>
</div>
