import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository.js';

export const register = async (username, password, role = 'staff') => {
    const existingUser = await userRepository.findUserByUsername(username);
    if (existingUser) {
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        userId: uuidv4(),
        username,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString()
    };

    await userRepository.createUser(user);
    return user;
};

export const login = async (username, password) => {
    const user = await userRepository.findUserByUsername(username);
    if (!user) {
        throw new Error('Invalid username or password');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Invalid username or password');
    }

    return user;
};
