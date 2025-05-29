import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
// import { PRODUCTS } from "@/data/mock"; // <== Anda mungkin tidak lagi membutuhkan ini jika menggunakan data dari tRPC
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";

// =========================================================================
// Tambahan Import tRPC
// =========================================================================
import { api } from "@/utils/api";
// =========================================================================

const ProductsPage: NextPageWithLayout = () => {
  // =========================================================================
  // Ambil data produk menggunakan tRPC useQuery
  // =========================================================================
  const {
    data: products,
    isLoading,
    isError,
  } = api.product.getProducts.useQuery();
  // =========================================================================

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DashboardTitle>Product Management</DashboardTitle>
              <DashboardDescription>
                View, add, edit, and delete products in your inventory.
              </DashboardDescription>
            </div>
            <Button>Add New Product</Button>{" "}
            {/* Tombol ini tetap terlihat saat loading */}
          </div>
        </DashboardHeader>
        <div className="py-10 text-center">Loading products...</div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <DashboardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DashboardTitle>Product Management</DashboardTitle>
              <DashboardDescription>
                View, add, edit, and delete products in your inventory.
              </DashboardDescription>
            </div>
            <Button>Add New Product</Button>
          </div>
        </DashboardHeader>
        <div className="py-10 text-center text-red-500">
          Error loading products.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <Button>Add New Product</Button>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center">
            No products found. Add a new one!
          </p>
        ) : (
          products?.map((product) => {
            return (
              <ProductCatalogCard
                key={product.id}
                name={product.name}
                price={product.price}
                image={product.imageUrl ?? ""}
                // Jika ProductCatalogCard Anda memiliki prop onEdit/onDelete, Anda bisa menambahkannya di sini
                // onEdit={() => handleEditProduct(product)}
                // onDelete={() => handleDeleteProduct(product.id)}
              />
            );
          })
        )}
      </div>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
