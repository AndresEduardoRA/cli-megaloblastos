import type { App } from "vue";
import { plugin } from "@formkit/vue";
import config from "formkit.config.ts";

export default (app: App) => {
  app.use(plugin, config);
};
