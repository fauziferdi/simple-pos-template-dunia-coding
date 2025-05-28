import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryCatalogCard } from "@/components/shared/category/CategoryCatalogCard"; // <-- Ini komponen yang sudah Anda perbarui
import { CategoryForm } from "@/components/shared/category/CategoryForm";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { type Category } from "@/data/mock"; // <== Ini mungkin tidak lagi digunakan jika data dari tRPC
import { categoryFormSchema, type CategoryFormSchema } from "@/forms/category";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NextPageWithLayout } from "../_app";
import { api } from "@/utils/api";
// import { set } from "zod"; // <== Ini tidak perlu, bisa dihapus

const CategoriesPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  // State untuk menyimpan kategori yang sedang diedit
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null); // Tambahkan state ini

  const createCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const editCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    // Default values akan diatur saat handleClickEditCategory dipanggil
  });

  const {
    data: categories,
    isLoading,
    isError,
  } = api.category.getCategories.useQuery();

  const { mutate: createCategory } = api.category.createCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getCategories.invalidate();
      alert("Category created successfully");
      setCreateCategoryDialogOpen(false);
      createCategoryForm.reset();
    },
    onError: (error) => {
      // Tambahkan onError untuk createCategory
      console.error("Failed to create category:", error);
      alert("Failed to create category: " + error.message);
    },
  });

  const { mutate: deleteCategory } = api.category.deleteCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getCategories.invalidate();
      alert("Category deleted successfully");
      setCategoryToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category: " + error.message);
    },
  });

  // =========================================================================
  // Tambahan untuk updateCategory mutation
  // =========================================================================
  const { mutate: updateCategory } = api.category.updateCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getCategories.invalidate();
      alert("Category updated successfully");
      setEditCategoryDialogOpen(false);
      setCategoryToEdit(null); // Reset categoryToEdit
      editCategoryForm.reset(); // Reset form setelah sukses
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
      alert("Failed to update category: " + error.message);
    },
  });
  // =========================================================================

  const handleSubmitCreateCategory = (data: CategoryFormSchema) => {
    createCategory({
      name: data.name,
    });
  };

  const handleSubmitEditCategory = (data: CategoryFormSchema) => {
    if (categoryToEdit) {
      // Pastikan ada kategori yang sedang diedit
      updateCategory({
        id: categoryToEdit.id, // Gunakan ID dari categoryToEdit
        name: data.name,
      });
    }
  };

  const handleClickEditCategory = (category: Category) => {
    setEditCategoryDialogOpen(true);
    setCategoryToEdit(category); // Simpan kategori yang akan diedit
    editCategoryForm.reset({
      // Atur nilai form sesuai kategori yang akan diedit
      name: category.name,
    });
  };

  const handleClickDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory({ categoryId: categoryToDelete });
    }
  };

  if (isLoading) return <div>Loading categories...</div>; // Tampilkan loading state
  if (isError) return <div>Error loading categories.</div>; // Tampilkan error state

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Category Management</DashboardTitle>
            <DashboardDescription>
              Organize your products with custom categories.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createCategoryDialogOpen}
            onOpenChange={setCreateCategoryDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Category</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Category</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createCategoryForm}>
                <CategoryForm
                  onSubmit={handleSubmitCreateCategory}
                  submitText="Create Category"
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={createCategoryForm.handleSubmit(
                    handleSubmitCreateCategory,
                  )}
                >
                  Create Category
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-4 gap-4">
        {/* ========================================================================= */}
        {/* Menggunakan prop onEdit dan onDelete pada CategoryCatalogCard */}
        {/* ========================================================================= */}
        {categories?.length === 0 ? (
          <p className="text-muted-foreground col-span-4 text-center">
            No categories found. Add a newd one!
          </p>
        ) : (
          categories?.map((category) => {
            return (
              <CategoryCatalogCard
                key={category.id}
                name={category.name}
                productCount={category.productCount}
                onEdit={() => handleClickEditCategory(category)} // Meneruskan objek kategori
                onDelete={() => handleClickDeleteCategory(category.id)} // Meneruskan ID kategori
              />
            );
          })
        )}
        {/* ========================================================================= */}
      </div>

      {/* ========================================================================= */}
      {/* Dialog Edit Category */}
      {/* ========================================================================= */}
      <AlertDialog
        open={editCategoryDialogOpen}
        onOpenChange={(open) => {
          setEditCategoryDialogOpen(open);
          if (!open) {
            setCategoryToEdit(null); // Reset categoryToEdit saat dialog ditutup
            editCategoryForm.reset(); // Reset form saat dialog ditutup
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editCategoryForm}>
            <CategoryForm
              onSubmit={handleSubmitEditCategory}
              submitText="Save Changes" // Ubah teks tombol
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={editCategoryForm.handleSubmit(handleSubmitEditCategory)}
            >
              Save Changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* ========================================================================= */}

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDeleteCategory}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

CategoriesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CategoriesPage;
