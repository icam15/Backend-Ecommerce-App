import { prisma } from "../libs/prisma";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category-types";

export class CategoryService {
  static async createCategory(userId: number, payload: CreateCategoryPayload) {
    const newCategory = await prisma.category.create({
      data: {
        name: payload.name,
        iconUrl: payload.iconUrl,
        ecommerceAdminId: userId,
      },
    });
    return newCategory;
  }

  static async updateCategory(
    userId: number,
    categoryId: number,
    payload: UpdateCategoryPayload
  ) {
    const updateCategory = await prisma.category.update({
      where: {
        ecommerceAdminId: userId,
        id: categoryId,
      },
      data: {
        name: payload.name,
        iconUrl: payload.iconUrl,
      },
    });
    return updateCategory;
  }

  static async deleteCategory(userId: number, categoryId: number) {
    await prisma.category.delete({
      where: {
        id: categoryId,
        ecommerceAdminId: userId,
      },
    });
  }

  static async getCategoryById(categoryId: number) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
      },
    });
    return category;
  }

  static async getCategories() {}
}
