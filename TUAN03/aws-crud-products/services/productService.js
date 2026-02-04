import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from '../config/aws.js';
import * as productRepository from '../repositories/productRepository.js';
import * as logRepository from '../repositories/logRepository.js';

export const getAllProducts = async (filters) => {
    const { items, lastEvaluatedKey } = await productRepository.getAllProducts(filters);

    // Add inventory status
    const products = items.map(p => {
        let status = 'In Stock';
        if (p.quantity === 0) status = 'Out of Stock';
        else if (p.quantity < 5) status = 'Low Stock';

        return { ...p, inventoryStatus: status };
    });

    return { products, lastEvaluatedKey };
};

export const getProductById = async (id) => {
    return await productRepository.getProductById(id);
};

export const createProduct = async (productData, file, userId) => {
    const id = uuidv4();
    let imageUrl = '';

    if (file) {
        const Key = `${Date.now()}-${file.originalname}`;
        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key,
            Body: file.buffer,
            ContentType: file.mimetype
        }));
        imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
    }

    const newProduct = {
        id,
        name: productData.name,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        categoryId: productData.categoryId,
        url_image: imageUrl,
        isDeleted: false,
        createdAt: new Date().toISOString()
    };

    await productRepository.createProduct(newProduct);

    // Log
    await logRepository.createLog({
        logId: uuidv4(),
        productId: id,
        action: 'CREATE',
        userId: userId || 'system',
        time: new Date().toISOString()
    });

    return newProduct;
};

export const updateProduct = async (id, productData, file, userId) => {
    // Get current product to find old image
    const currentProduct = await productRepository.getProductById(id);

    const updates = { ...productData };

    if (file) {
        // Delete old image
        if (currentProduct && currentProduct.url_image) {
            // Import helper to avoid circular dependency or just use s3 directly if possible. 
            // Better: use the helper we just made in config/aws.js
            // But services/productService imports from config/aws.js already. 
            // We need to update the import in this file first.
            const { deleteS3Object } = await import('../config/aws.js');
            await deleteS3Object(currentProduct.url_image);
        }

        const Key = `${Date.now()}-${file.originalname}`;
        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key,
            Body: file.buffer,
            ContentType: file.mimetype
        }));
        updates.url_image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
    }

    // Convert numbers
    if (updates.price) updates.price = Number(updates.price);
    if (updates.quantity) updates.quantity = Number(updates.quantity);

    await productRepository.updateProduct(id, updates);

    // Log
    await logRepository.createLog({
        logId: uuidv4(),
        productId: id,
        action: 'UPDATE',
        userId: userId || 'system',
        time: new Date().toISOString()
    });
};

export const deleteProduct = async (id, userId) => {
    await productRepository.softDeleteProduct(id);

    // Log
    await logRepository.createLog({
        logId: uuidv4(),
        productId: id,
        action: 'DELETE',
        userId: userId || 'system',
        time: new Date().toISOString()
    });
};
