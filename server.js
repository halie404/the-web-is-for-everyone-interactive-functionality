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

// --- API base url ---
const directusApiBaseUrl = "https://fdnd-agency.directus.app/items";

// --- endpoints for:
//  - webinars (list of webinars enzo toch) ---
const webinarsEndpoint = `${directusApiBaseUrl}/avl_webinars`;
// --- categories (for the webinars used to filter) ---
const categoriesEndpoint = `${directusApiBaseUrl}/avl_categories`;
//--- messages a.k.a. bookmarks: post bookmarks here and get bookmarks ---
const bookmarksEndpoint = `${directusApiBaseUrl}/avl_messages`;

// --- start endpoints ---

//--- endpoint 1 ---
/**
 * @description this is the startingpoint (home, index, ect)
 * @route {get} /
 */
app.get("/", (req, res) => {
  res.render("index.liquid");
});

//--- endpoint 2 ---
/**
 * @description shows list of all the webinars in the directus API
 * @route {get} /webinars
 */
app.get("/webinars", async (req, res) => {
  try {
    const webinarsList = await fetch(
      webinarsEndpoint +
        "?fields=id,duration,title,thumbnail,categories.*.*,speakers.*.*"
    );
    const { data: webinarResponseJSON } = await webinarsList.json();

    // --- function to map webinars and return object  ---
    const webinars = webinarResponseJSON.map((webinar) => ({
      id: webinar.id,
      title: webinar.title,
      duration: webinar.duration,
      thumbnail: webinar.thumbnail,
      categories: webinar.categories,
      speakers: webinar.speakers,
    }));

    res.render("webinars.liquid", {
      webinars: webinars,
    });
  } catch (error) {
    res.status(500).json({ error: "foutjeee" });
  }
});

// --- endpoint bookmarks ---
app.post("/bookmarks", async (req, res) => {
  const { name, id } = req.param;

  // --- create the bookmark ---
  await fetch(bookmarksEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ for: name, from: id }), // Create the bookmark with correct data
  });

  res.redirect(303, "/webinars");
});
// --- server setup stufff ---
app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), () => {
  console.log(`App is running on http://localhost:${app.get("port")}`);
});
