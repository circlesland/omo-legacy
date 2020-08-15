<script lang="ts">
    export let data = {
        $schemaId: "https://example.com/message.schema.json",
        message: "Hello World!"
    };
</script>
<div>
    This is a message. It's value is: {data.message}
</div>
