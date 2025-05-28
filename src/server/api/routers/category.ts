import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
// import { create } from "domain"; // <== Ini tidak perlu, bisa dihapus

export const categoryRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        productCount: true,
      },
      orderBy: { name: "asc" }, // Tambahkan ini agar data terurut
    });
    return categories;
  }),

  // Tambah Category
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Minimum of 3 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newCategory = await db.category.create({
        data: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          productCount: true,
        },
      });
      return newCategory;
    }),

  // Delete Category
  deleteCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const deletedCategory = await db.category.delete({
        where: {
          id: input.categoryId,
        },
      });
      return deletedCategory;
    }),

  // =========================================================================
  // Tambahan: Update Category
  // =========================================================================
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(), // ID kategori yang akan diupdate
        name: z.string().min(3, "Category name must be at least 3 characters"), // Nama baru untuk kategori
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const updatedCategory = await db.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
        select: {
          // Pilih field yang ingin Anda kembalikan setelah update
          id: true,
          name: true,
          productCount: true,
        },
      });

      return updatedCategory;
    }),
  // =========================================================================
});
