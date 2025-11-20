import { defineConfig } from "shadcn";

export default defineConfig({
  $schema: "https://shadcn.com/schema.json",
  outDir: "components/ui",
  components: "default",
  aliases: {
    components: "@/components",
    lib: "@/lib",
    ui: "@/components/ui",
  },
});
