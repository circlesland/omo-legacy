<script>
  import OmoToggle from "./../1-atoms/OmoToggle.svelte";

  export let omotoggle = {
    status: true
  };
  export let omotoggle2 = {
    status: false
  };
</script>

<div class="container mx-auto">
  <div class="container">
    <div style="overflow-x:auto;">
      <table class="w-full shadow-lg rounded ">
        <thead class="">
          <tr class=" text-gray-600 text-left bg-gray-300 uppercase">
            <th class="px-2 py-1 text-sm">Status</th>
            <th class="text-sm">Name</th>
            <th class="hidden md:table-cell text-sm">Mobile</th>
            <th class="hidden md:table-cell text-sm ">Email</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr class="accordion border-b border-grey-light hover:bg-gray-100">
            <td class="px-3 py-4">
              <OmoToggle {omotoggle} />
            </td>
            <td class="flex inline-flex items-center">
              <span>
                <img
                  class="hidden mr-1 md:mr-2 md:inline-block h-8 w-8
                  rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=144&h=144&q=80"
                  alt="" />
              </span>
              <span class="py-4 w-40">
                <p class="text-gray-800 text-sm">Loki Owiredu</p>
                <p class="md:hidden text-xs text-gray-600 font-medium">
                  244224317
                </p>
                <p
                  class="hidden md:table-cell text-xs text-gray-500 font-medium">
                  Manager
                </p>
              </span>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-sm text-gray-800 font-medium">244224317</p>
              <p class="text-xs text-gray-500 font-medium">
                bernardkissi18@gmail.com
              </p>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-sm text-gray-700 font-medium">
                Bernardkissi18@gmail.com
              </p>
            </td>
          </tr>

          <tr class="accordion border-b border-grey-light hover:bg-gray-100">
            <td class="px-3 py-4">
              <OmoToggle {omotoggle2} />
            </td>
            <td class="flex inline-flex items-center">
              <span>
                <img
                  class="hidden mr-1 md:mr-2 md:inline-block h-8 w-8
                  rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=144&h=144&q=80"
                  alt="" />
              </span>
              <span class="py-3 w-40">
                <p class="text-gray-800 text-sm">Loki Owiredu</p>
                <p class="md:hidden text-xs text-gray-600 font-medium">
                  244224317
                </p>
                <p
                  class="hidden md:table-cell text-xs text-gray-500 font-medium">
                  Manager
                </p>
              </span>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-sm text-gray-800 font-medium">244224317</p>
              <p class="text-xs text-gray-500 font-medium">
                bernardkissi18@gmail.com
              </p>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-sm text-gray-700 font-medium">
                Bernardkissi18@gmail.com
              </p>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</div>
