const fs = require('fs');
const pinyin = require('pinyin').default;
const pinyin2 = require('chinese-to-pinyin');


const fileContents = fs.readFileSync('asset/chinese_words.txt', 'utf8');
const lines = fileContents.split('\n');
const words = lines.map(line => line.replace('\n', ''));

// const dictionary = words.map(char => {
//   const pinyinStr = pinyin(char).flat().join('');
//   return `${char},${pinyinStr}`;
// });
// console.log(dictionary);

const dictionary = words.map(char => {
  const pinyinStr = pinyin2(char,{removeSpace: true});
  return `${char},${pinyinStr}`;
});
console.log(dictionary);

// fs.writeFile('pinyin-dictionary.txt', dictionary.join('\n'), (err) => {
//   if (err) {
//     console.error('Error writing the file:', err);
//   } else {
//     console.log('Pinyin dictionary saved successfully.');
//   }
// });

fs.writeFile('pinyin-dictionary.txt', dictionary.join('\n'), (err) => {
  if (err) {
    console.error('Error writing the file:', err);
  } else {
    console.log('Pinyin dictionary saved successfully.');
  }
});