import Link from "next/link";
import { quicksand } from "@/fonts";
import styles from "./Hero.module.css";

const categories = [
  {
    name: "Laptops",
    image: "/hero_cat1.png",
  },
  {
    name: "PC & Computers",
    image: "/hero_cat2.png",
  },
  {
    name: "Cell Phones",
    image: "/hero_cat3.png",
  },
  {
    name: "Tablets",
    image: "/hero_cat4.png",
  },
  {
    name: "Cameras",
    image: "/hero_cat5.png",
  },
];

export default function CategoryList() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm h-full">
      <h3
        className={`catListHeading relative mb-10 fs-24-700 ${quicksand.className} ${styles.catListHeading}`}
      >
        Category
      </h3>

      <ul className="space-y-3 text-sm">
        {categories.map((cat, index) => (
          <li key={index} className="border border-[#F2F3F4] rounded-lg">
            <Link
              href={`/category/${cat.name.toLowerCase()}`}
              className="flex justify-between items-center fs-14-600 hover:text-[#01A49E] transition px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <img src={cat.image} alt={cat.name} />
                {cat.name}
              </div>
              <span className="bg-green-47 w-6 h-6 flex items-center justify-center rounded-full text-blue fs-12-400">
                {index + 1}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
