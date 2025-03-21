import express from "express";
import { Liquid } from "liquidjs";
import fetch from "node-fetch"; // Required for fetch in Node.js

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
const avlMessagesFilter = "?filter[for][_eq]=Bookmark for Jane Doe";

// Fetch webinars list
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

// Fetch bookmarks
async function fetchBookmarkedWebinars() {
  const bookmarksResponse = await fetch(
    avlMessagesEndpoint + avlMessagesFilter
  );
  const { data: bookmarks } = await bookmarksResponse.json();

  const bookmarkedWebinarIds = new Set(
    bookmarksResponseJSON.data.map((item) => String(item.text))
  );

  const webinars = await fetchWebinarsList();
  const bookmarkedWebinars = webinars.filter((webinar) =>
    bookmarkedWebinarIds.has(String(webinar.id))
  );

  return { bookmarkedWebinars, bookmarks };
}

// Route to display webinars
app.get("/webinars", async (req, res) => {
  const webinarsList = await fetchWebinarsList();
  res.render("webinars.liquid", { webinars: webinarsList });
});

// Route to display bookmarked webinars
app.get("/bookmarks", async (req, res) => {
  const { bookmarkedWebinars, bookmarks } = await fetchBookmarkedWebinars();
  res.render("bookmarks.liquid", { webinars: bookmarkedWebinars, bookmarks });
});

// Route to handle bookmarking a webinar
app.post("/webinars", async (req, res) => {
  const { textField, forField } = req.body;

  const newBookmark = {
    text: textField,
    for: forField,
  };

  try {
    await fetch(avlMessagesEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBookmark),
    });

    if (!response.ok) {
      throw new Error(`Failed to bookmark: ${response.statusText}`);
    }

    res.redirect("/webinars");
  } catch (error) {
    console.error("Error saving bookmark:", error);
    res.status(500).send("Error saving bookmark.");
  }
});

app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), () => {
  console.log(`App is running on http://localhost:${app.get("port")}`);
});
