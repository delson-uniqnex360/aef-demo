import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductBySku } from "../api/productDetail";

export default function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const [activeTab, setActiveTab] = useState<"description" | "technical">(
    "description",
  );

  // Asynchronous product states
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState("");

  // Handle async product fetching
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const result = await getProductBySku(sku);
      setProduct(result);
      setLoading(false);
    }

    loadProduct();
  }, [sku]);

  // Sync selectedMedia once product data is loaded or changes
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedMedia(product.images[0]);
    } else {
      setSelectedMedia("");
    }
  }, [product]);

  // Helper to detect if a string is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url
      ? url.includes("youtube.com") || url.includes("youtu.be")
      : false;
  };

  // Helper to extract clean embed ID from various YouTube formats
  const getYouTubeEmbedId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // 1. Loading State UI
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  // 2. Fallback UI if product is not found after loading finishes
  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          We couldn't find a product with SKU:{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{sku}</span>
        </p>
        <Link
          to="/"
          className="bg-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-700 transition"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 antialiased font-sans">
      {/* 1. Header Breadcrumbs & Category Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-orange-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-orange-600 transition">
            Shop
          </Link>
          <span>/</span>
          {product.categories?.map((cat: string, idx: number) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="capitalize">{cat}</span>
              {idx < product.categories.length - 1 && <span>/</span>}
            </span>
          ))}
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">
            {product.product_name}
          </span>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        {/* 2. Top Section: Core Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Modern Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage View */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative p-6 shadow-sm">
              {isYouTubeUrl(selectedMedia) ? (
                <iframe
                  className="w-full h-full rounded-xl"
                  src={`https://www.youtube.com/embed/${getYouTubeEmbedId(selectedMedia)}`}
                  title="Product Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <img
                  src={selectedMedia || "/placeholder-image.jpg"}
                  alt={product.product_name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Scrollable Thumbnails row */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-300">
              {product.images?.map((media: string, index: number) => {
                const isVideo = isYouTubeUrl(media);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(media)}
                    className={`w-24 h-20 flex-shrink-0 border-2 rounded-xl overflow-hidden bg-white snap-start relative flex items-center justify-center p-1 transition-all ${
                      selectedMedia === media
                        ? "border-orange-600 ring-2 ring-orange-100"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center rounded-lg">
                        <span className="text-xs font-bold text-white tracking-wide">
                          VIDEO
                        </span>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white pl-0.5 shadow-md">
                            ▶
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={media}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Checkout Purchase Card & Meta */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-semibold text-orange-600 tracking-wider uppercase">
                  {product.brand}
                </span>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  SKU: {product.sku}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {product.product_name}
              </h1>
              <p className="text-xs text-gray-400 mt-1">MPN: {product.mpn}</p>
            </div>

            {/* Price block */}
            <div className="border-y border-gray-100 py-4 flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight text-gray-900">
                {product.currency === "EUR" ? "€" : product.currency || "$"}29
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                .99
              </span>
              <span className="text-xs text-gray-400 ml-2 font-medium">
                incl. VAT
              </span>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                In Stock
              </span>
            </div>

            {/* Interactive Quantity & Add Action */}
            <div className="flex gap-3">
              <div className="w-24 border border-gray-300 rounded-xl flex items-center justify-between px-3 bg-gray-50 focus-within:border-orange-500 transition-colors">
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  className="w-full bg-transparent font-semibold text-center outline-none py-3 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-600/10 active:scale-[0.99] transition transform-all uppercase tracking-wider text-sm">
                Add To Cart
              </button>
            </div>

            {/* Modern Native Social Share Layer */}
            <div className="flex items-center gap-2 pt-2 text-gray-500 border-t border-gray-100">
              <span className="text-xs font-semibold mr-2">Share item:</span>
              {["𝕏", "✉", "💬", "🔗"].map((icon, idx) => (
                <button
                  key={idx}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 flex items-center justify-center transition-colors text-sm"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Bottom Section: Tabbed Content Panels */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Selection Header */}
          <div className="flex border-b border-gray-200 bg-gray-50/70 px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3.5 text-sm font-bold tracking-wide rounded-t-xl transition-all border-t-2 -mb-px ${
                activeTab === "description"
                  ? "bg-white border-orange-600 text-orange-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`px-6 py-3.5 text-sm font-bold tracking-wide rounded-t-xl transition-all border-t-2 -mb-px ${
                activeTab === "technical"
                  ? "bg-white border-orange-600 text-orange-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Technical Information
            </button>
          </div>

          {/* Panel View Switcher */}
          <div className="p-6 md:p-8 min-h-[250px]">
            {activeTab === "description" ? (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.brand} | {product.mpn}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    {product.product_name}
                  </h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.long_description}
                  </p>
                </div>

                {/* Features fallback list inside description context */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3">
                      Key Highlights:
                    </h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.features.map((feature: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <span className="text-orange-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 max-w-4xl">
                {/* Dynamically Populated Attributes Table */}
                {product.attributes && product.attributes.length > 0 ? (
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-4">
                      Specifications
                    </h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 font-mono text-[11px] tracking-wider uppercase">
                            <th className="px-6 py-3 font-semibold">
                              Parameter
                            </th>
                            <th className="px-6 py-3 font-semibold">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {product.attributes.map((attr: any, idx: number) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-gray-700 capitalize">
                                {attr.name.replace(/_/g, " ")}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {attr.value ?? "N/A"}{" "}
                                {attr.uom ? (
                                  <span className="text-xs text-gray-400 ml-0.5">
                                    {attr.uom}
                                  </span>
                                ) : (
                                  ""
                                )}
                              </td>
                            </tr>
                          ))}
                          {/* Weight and Unit parameters explicitly parsed from root key standard types */}
                          {product.weight && (
                            <tr className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-gray-700">
                                Gross Weight
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {product.weight}{" "}
                                <span className="text-xs text-gray-400">
                                  {product.weight_unit}
                                </span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No specific attributes found for this variant asset.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
