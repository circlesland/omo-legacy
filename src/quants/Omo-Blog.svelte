<script>
  export let db;
  let blog = db.blog;
</script>

<div class="flex justify-center my-20">
  <div class="w-5/6 xl:w-4/6">
    <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
    <h2
      class="text-center text-5xl text-ci mt-10 mb-6"
      style="font-family: 'Indie Flower'!important;">
      Unser Blog
    </h2>
    <div class="text-2xl text-gray-600 text-center mb-16">
      <p style="font-family: 'Indie Flower'!important;">
        "Lass dich inspireren von offenen Begegnungen, ehrlichen Geschichten und
        echten Freundschaften"
      </p>
    </div>
    <div class="flex content-start flex-wrap">
      {#each blog as article, i (article.id)}
        <div class="w-1/2 p-2">
          <div class="primary omo-shadow omo-border">
            <img
              src={article.image}
              class="primary h-64 w-full rounded-t-lg object-cover object-center"
              alt="image" />
            <div class="p-8">
              <h1
                class="text-xl font-black leading-tight"
                style="font-family: 'Indie Flower'!important;">
                {article.title}
                <span class="text-ci-2">{article.subtitle}</span>
              </h1>
              <p class="mt-2 text-gray-600">{article.excerpt}</p>
              <div class="mt-4">
                <a
                  href="#linktoblog"
                  class="inline-block hover:bg-orange-300 hover:text-gray-800
                  bg-ci text-gray-100 rounded-full px-3 py-1 text-lg
                  font-semibold mb-4"
                  style="font-family: 'Indie Flower'!important;">
                  Weiterlesen
                </a>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
