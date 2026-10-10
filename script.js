
const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "campusLostFoundItemsV1";

const sampleItems = [
  {
    id: "demo1", type: "Lost", name: "Black Backpack",
    description: "Black backpack with a laptop compartment.",
    location: "Library", date: "2026-10-08",
    contact: "", status: "Open"
  },
  {
    id: "demo2", type: "Found", name: "Student ID Card",
    description: "ID card found near the main entrance.",
    location: "Main Gate", date: "2026-10-09",
    contact: "", status: "Open"
  },
  {
    id: "demo3", type: "Lost", name: "Blue Water Bottle",
    description: "Blue bottle with a white logo.",
    location: "Cafeteria", date: "2026-10-07",
    contact: "", status: "Open"
  },
  {
    id: "demo4", type: "Found", name: "Notebook",
    description: "Notebook with a light blue cover.",
    location: "Classroom Block", date: "2026-10-06",
    contact: "", status: "Open"
  }
];

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn("Could not load saved items.", error);
  }
  return sampleItems.map(item => ({ ...item }));
}

let items = loadItems();

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.warn("Could not save items.", error);
    return false;
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderItems() {
  const query = $("searchInput").value.trim().toLowerCase();
  const filter = $("typeFilter").value;
  const sort = $("sortFilter").value;

  const filtered = items.filter(item => {
    const searchable = [
      item.name, item.description, item.location
    ].join(" ").toLowerCase();

    return (filter === "All" || item.type === filter)
      && searchable.includes(query);
  });

  filtered.sort((a, b) => {
    const comparison = (a.date || "").localeCompare(b.date || "");
    return sort === "newest" ? -comparison : comparison;
  });

  const list = $("itemList");
  list.replaceChildren();

  $("emptyMessage").classList.toggle("hidden", filtered.length > 0);

  filtered.forEach(item => {
    const card = makeElement("article", "item-card");
    const tag = makeElement(
      "span", `tag ${item.type.toLowerCase()}`, `${item.type} Item`
    );

    card.append(tag);
    card.append(makeElement("h3", "", item.name));
    card.append(makeElement("p", "", item.description));
    card.append(makeElement("p", "item-meta", `📍 ${item.location}`));
    card.append(makeElement("p", "item-meta", `📅 ${item.date}`));

    const button = makeElement(
      "button", "claim-btn",
      item.status === "Resolved"
        ? "Resolved"
        : item.type === "Found" ? "Claim Item" : "I Found This"
    );
    button.type = "button";
    button.disabled = item.status === "Resolved";

    button.addEventListener("click", () => {
      if (item.status === "Resolved") return;

      const message = item.type === "Found"
        ? "Claiming an item requires verifying its ownership with campus staff."
        : "Please contact campus staff if you have found this item.";

      alert(message + "\n\nThis is a demo. No claim has been submitted.");
    });

    card.append(button);
    list.append(card);
  });

  $("totalCount").textContent = items.length;
  $("lostCount").textContent =
    items.filter(item => item.type === "Lost").length;
  $("foundCount").textContent =
    items.filter(item => item.type === "Found").length;
}

$("searchInput").addEventListener("input", renderItems);
$("typeFilter").addEventListener("change", renderItems);
$("sortFilter").addEventListener("change", renderItems);

$("itemDate").max = new Date().toLocaleDateString("en-CA");

$("reportForm").addEventListener("submit", event => {
  event.preventDefault();

  const item = {
    id: "item_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    type: $("itemType").value,
    name: $("itemName").value.trim(),
    description: $("description").value.trim(),
    location: $("location").value.trim(),
    date: $("itemDate").value,
    contact: $("contact").value.trim(),
    status: "Open"
  };

  if (!item.name || !item.description || !item.location ||
      !item.date || !item.contact) {
    $("formMessage").textContent = "Please fill in all required fields.";
    return;
  }

  items.unshift(item);

  if (!saveItems()) {
    items.shift();
    $("formMessage").textContent =
      "Could not save this report. Check browser storage settings.";
    return;
  }

  $("formMessage").textContent =
    "Report added successfully! It is visible in this browser prototype.";

  $("reportForm").reset();
  $("itemDate").max = new Date().toLocaleDateString("en-CA");
  renderItems();

  $("browse").scrollIntoView({ behavior: "smooth" });
});

renderItems();
