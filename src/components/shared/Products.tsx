import { productSource } from "@/helpers/productSource";
import Link from "next/link";

export default function Products() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between space-x-4">
          <h2 className="text-lg font-medium text-gray-900">
            Catalogue
          </h2>
          <span className="whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
            <span aria-hidden="true"> &rarr;</span>
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
          {productSource.map((product) => (

            <Link
            href={`/product/${product.productSlug}`}
              
              key={product.id}
              className="group relative"
            >
              <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover object-center h-full"
                />
                <div
                  className="flex items-end p-4 opacity-0 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <button
                    
                    className="w-full rounded-md bg-white bg-opacity-75 px-4 py-2 text-center text-sm font-medium text-gray-900 backdrop-blur backdrop-filter"
                  >
                    View Product
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between space-x-8 text-base font-medium text-gray-900">
                <h3>
                  <span>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </span>
                </h3>
                <p>{product.price} cUSD</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">{product.productSlug}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
