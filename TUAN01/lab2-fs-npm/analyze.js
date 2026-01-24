const fs = require('fs/promises');
const _ = require('lodash');
const chalk = require('chalk'); // optional, tô màu kết quả

async function main() {
    const inputFile = 'log.txt';

    try {
        // Đọc file
        const data = await fs.readFile(inputFile, 'utf8');
        const lines = data.split(/\r?\n/);
        const lineCount = lines.length;

        // Tính số từ
        const words = data.split(/\s+/).filter(Boolean);
        const wordCount = words.length;

        // Tìm từ dài nhất
        const longestWord = _.maxBy(words, 'length');

        //Hiển thị kết quả
        console.log(chalk.green(`Analysis of "${inputFile}":`));
        console.log(`- Number of lines: ${lineCount}`);
        console.log(`- Number of words: ${wordCount}`);
        console.log(`- Longest word: ${longestWord}`);

    } catch (err) {
        console.log(chalk.red(`Error: ${err.message}`));
    }
}

main();