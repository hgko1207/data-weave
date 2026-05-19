import { BookOpen } from "lucide-react";
import type { Widget } from "../_types";
import { fetchLibrary } from "./fetch";
import { LibraryRender } from "./Render";
import type { LibraryData } from "./schema";

export const libraryWidget: Widget<LibraryData> = {
  id: "library",
  title: "공공도서관",
  icon: BookOpen,
  category: "view",
  fetch: fetchLibrary,
  Render: LibraryRender,
};
