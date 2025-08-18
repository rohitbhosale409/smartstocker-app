import { AtomRouter } from "./lib/atom-router.js";
import home from "./pages/home.js";
import details from "./pages/details.js";
import addItem from "./pages/addItem.js";

const router = new AtomRouter({ rootId: "app", debug: false });

router.add([
  { url: "/", handler: home },
  { url: "/details", handler: details },
  { url: "/addItem", handler: addItem },
]);

export default router;
