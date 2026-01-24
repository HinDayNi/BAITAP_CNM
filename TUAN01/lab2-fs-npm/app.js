// const fs = require('fs');

const fs = require('fs/promises');

const chalk = require('chalk');

// async function main() {
//     // Lấy tên file từ command line
//     const fileName = process.argv[2];

//     if (!fileName) {
//         console.log("Please provide a file name: node app.js <filename>");
//         process.exit(1);
//     }

//     try {
//         // Đọc file bất đồng bộ với await
//         const data = await fs.readFile(fileName, 'utf8');

//         // Hiển thị nội dung
//         console.log(`Content of "${fileName}":`);
//         console.log(data);

//     } catch (err) {
//         // Xử lý lỗi (file không tồn tại hoặc không đọc được)
//         // console.log(`Error reading file "${fileName}":`, err.message);
//         console.log(chalk.red(`Error reading file "${fileName}": ${err.message}`));
//     }
// }

// // Gọi hàm chính
// main();

async function main() {
    const inputFile = 'log.txt';
    const outputFile = 'report.txt';

    try {
        // Đọc file log.txt
        const data = await fs.readFile(inputFile, 'utf8');

        // Đếm số dòng
        const lines = data.split(/\r?\n/); // tách cả Windows (\r\n) & Unix (\n)
        const lineCount = lines.length;

        // Ghi kết quả vào report.txt
        const reportContent = `File "${inputFile}" contains ${lineCount} lines.`;
        await fs.writeFile(outputFile, reportContent);

        // Thông báo thành công
        console.log(chalk.green(`Report generated successfully in "${outputFile}"`));
        console.log(reportContent);

    } catch (err) {
        console.log(chalk.red(`Error: ${err.message}`));
    }
}

main();



// Đọc file và hiển thị nội dung
// fs.readFile(fileName, 'utf8', (err, data) => {
//     if (err) {
//         console.log(`Error reading file "${fileName}":`, err.message);
//         return;
//     }

//     console.log(`Content of "${fileName}":`);
//     console.log(data);
// });

// const _ = require('lodash');

// const numbers = [1, 2, 3, 4, 5];
// const shuffled = _.shuffle(numbers);

// console.log('Original:', numbers);
// console.log('Shuffled:', shuffled);

//readFile: Đọc file
// fs.readFile('input.txt', 'utf8', (err, data) => {
//     if (err) {
//         console.log("Error reading file:", err)
//         return
//     }
//     console.log('File content:');
//     console.log(data);
// })

//readFile: Đọc file student.txt
// fs.readFile('student.txt', 'utf8', (err, data) => {
//     if (err) {
//         console.log("Error reading file:", err)
//         return
//     }
//     console.log('File content:');
//     console.log(data);
//     // Ghi nội dung vào backup.txt BÊN TRONG callback
//     fs.writeFile('backup.txt', data, (err) => {
//         if (err) {
//             console.log("Error writing file:", err);
//             return;
//         }

//         console.log("Backup successful! Content written to backup.txt");
//     });
// })

//writeFile: Ghi file
// fs.writeFile('output.txt', 'File written using Node.js fs module!', (err) => {
//     if (err) {
//         console.error('Error writing file:', err);
//         return;
//     }
//     console.log('File written successfully!');
// });

//appendFile: Thêm nội dung vào cuối file
// fs.appendFile('output.txt', '\nAppending new content...', (err) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log('Data appended!');
// });