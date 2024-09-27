import { prisma } from "../libs/prisma";
import { CreateCategoryPayload } from "../types/category-types";

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

  static async deleteCategory() {}
  static async updateCategory() {}
  static async getCategoryById() {}
  static async getCategories() {}
}
