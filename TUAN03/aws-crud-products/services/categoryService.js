import { v4 as uuidv4 } from 'uuid';
import * as categoryRepository from '../repositories/categoryRepository.js';

export const getAllCategories = async () => {
    return await categoryRepository.getAllCategories();
};

export const createCategory = async (name, description) => {
    const categoryId = uuidv4();
    const category = {
        categoryId,
        name,
        description
    };
    await categoryRepository.createCategory(category);
    return category;
};

export const getCategoryById = async (categoryId) => {
    return await categoryRepository.getCategoryById(categoryId);
};

export const updateCategory = async (categoryId, name, description) => {
    await categoryRepository.updateCategory(categoryId, name, description);
};

export const deleteCategory = async (categoryId) => {
    // Ideally check if products exist for this category first, but req says "Do not delete products" business rule.
    // So we just delete the category.
    await categoryRepository.deleteCategory(categoryId);
};
