import HeroSlider from "./HeroSlider";
import CategoryList from "./CategoryList";

export default function Hero() {
  return (
    <section>
      <div className="container mx-auto py-4 flex flex-col lg:flex-row gap-6 items-stretch">

        {/* Sidebar */}
        <div className="lg:w-1/4 h-full">
          <CategoryList />
        </div>

        {/* Slider */}
        <div className="lg:w-3/4 relative">
          <HeroSlider />
        </div>

      </div>
    </section>
  );
}