import { useState, useEffect } from "react";
import type { SubCategory, MainCategory } from "../types/Product";
import { buildCategoryTree } from "../api/category";

export default function MegaMenu() {
  const [menuData, setMenuData] = useState<MainCategory[]>([]);
  const [activeMain, setActiveMain] = useState<MainCategory | null>(null);
  const [activeSub, setActiveSub] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {

    fetch("/db.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load db.json");
        return res.json();
      })
      .then((rawData) => {

        // FIX: Extract the nested array from rawData.data before passing it
        const productsArray = Array.isArray(rawData) ? rawData : rawData.data;


        const structuredTree = buildCategoryTree(productsArray || []);


        setMenuData(structuredTree);
        setLoading(false);
      })
      .catch((err) => {
        console.error("MegaMenu: Error loading or processing database:", err);
        setLoading(false);
      });
  }, []);



  const handleRedirect = (path: string) => {
    window.location.href = path;
  };

  const handleMainItemClick = (category: MainCategory) => {
    if (activeMain?.id === category.id) {
      setActiveMain(null);
      setActiveSub(null);
    } else {
      setActiveMain(category);
      if (category.subCategories && category.subCategories.length > 0) {
        setActiveSub(category.subCategories[0]);
      } else {
        setActiveSub(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#14002a] text-white p-3 text-xs font-semibold animate-pulse">
        Loading Categories Tree Data Matrix...
      </div>
    );
  }

  return (
    <div className="relative w-full z-50 select-none">
      {/* Category 1: Top Horizontal Menu Bar */}
      <nav className="w-full bg-[#14002a] text-white px-4 py-3 border-b border-purple-950">
        <div className="max-w-[1600px] mx-auto flex items-center justify-start space-x-6 lg:space-x-8 xl:space-x-12 overflow-x-auto no-scrollbar">
          {menuData.map((mainCat) => {
            const isOpen = activeMain?.id === mainCat.id;
            return (
              <button
                key={mainCat.id}
                onClick={() => handleMainItemClick(mainCat)}
                className={`flex items-center space-x-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors outline-none focus:outline-none py-1 border-b-2 ${
                  isOpen
                    ? "text-[#ff6a00] border-[#ff6a00]"
                    : "text-white border-transparent hover:text-orange-400"
                }`}
              >
                <span>{mainCat.title}</span>
                <svg
                  className={`w-2.5 h-2.5 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mega Dropdown Panel */}
      {activeMain && activeMain.subCategories.length > 0 && (
        <div
          className="absolute left-0 w-full bg-white text-gray-800 shadow-2xl flex border-b border-gray-200 cursor-pointer"
          style={{ minHeight: "380px" }}
        >
          {/* Category 2: Left Vertical Sidebar Pane */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 cursor-pointer">
            {activeMain.subCategories.map((subCat) => {
              const isSubActive = activeSub?.id === subCat.id;
              return (
                <div
                  key={subCat.id}
                  onMouseEnter={() => {
                    setActiveSub(subCat);
                  }}
                  onClick={() => setActiveSub(subCat)}
                  className={`flex items-center justify-between px-4 py-3.5 text-xs font-semibold cursor-pointer border-b border-gray-100 transition-colors ${
                    isSubActive
                      ? "bg-[#ff6a00] text-white font-bold"
                      : "text-[#14002a] hover:bg-gray-50"
                  }`}
                >
                  <span>{subCat.title}</span>
                  <svg
                    className={`w-3 h-3 ${isSubActive ? "text-white" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Category 3 & 4: Right Grid Columns Display Content */}
          <div className="flex-1 p-6 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start content-start overflow-y-auto max-h-[550px]">
            {activeSub && activeSub.groups && activeSub.groups.length > 0 ? (
              activeSub.groups.map((group, groupIdx) => (
                <div key={groupIdx} className="flex flex-col space-y-3">
                  {/* Category 3 Header Title */}
                  <h3 className="text-[13px] font-bold text-gray-900 border-b border-gray-100 pb-2 tracking-tight cursor-pointer">
                    {group.title}
                  </h3>

                  {/* Category 4 Brand items nested inside */}
                  <ul className="flex flex-col space-y-1.5">
                    {group.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <button
                          onClick={() => handleRedirect(item.path)}
                          className="group flex items-center text-xs text-gray-700 hover:text-[#ff6a00] transition-colors font-medium text-left w-full"
                        >
                          <span className="text-gray-400 mr-2 group-hover:text-[#ff6a00] text-[10px] transition-colors font-bold">
                            &gt;
                          </span>
                          <span>{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 italic col-span-full p-4">
                No elements map to this specified segment path.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop overlay to close menu when clicking outside */}
      {activeMain && (
        <div
          className="fixed inset-0 bg-black/10 -z-10 cursor-default"
          onClick={() => {
            setActiveMain(null);
            setActiveSub(null);
          }}
        />
      )}
    </div>
  );
}
