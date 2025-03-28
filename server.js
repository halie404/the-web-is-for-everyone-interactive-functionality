import express from "express";
import { Liquid } from "liquidjs";
import fetch from "node-fetch";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const engine = new Liquid();
app.engine("liquid", engine.express());
app.set("view engine", "liquid");
app.set("views", "./views");

const baseApiEndpoint = "https://fdnd-agency.directus.app/items";

const avlWebinarsEndpoint = `${baseApiEndpoint}/avl_webinars`;
const avlWebinarFieldsFilter =
  "?fields=id,duration,title,thumbnail,categories.*.*,speakers.*.*";

const avlMessagesEndpoint = `${baseApiEndpoint}/avl_messages`;
const avlMessagesFilter = "?filter[for][_eq]=Jane Doe";

async function fetchWebinarsList() {
  const webinarsResponse = await fetch(
    avlWebinarsEndpoint + avlWebinarFieldsFilter
  );
  const webinarResponseJSON = await webinarsResponse.json();

  return webinarResponseJSON.data.map((webinar) => ({
    id: webinar.id,

    title: webinar.title,
    duration: webinar.duration,
    thumbnail: webinar.thumbnail,
    categories: webinar.categories,
    speakers: webinar.speakers,
  }));
}

app.get("/webinars", async (req, res) => {
  const webinarsList = await fetchWebinarsList();
  res.render("webinars.liquid", { webinars: webinarsList });
});

app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), () => {
  console.log(`App is running on http://localhost:${app.get("port")}`);
});
