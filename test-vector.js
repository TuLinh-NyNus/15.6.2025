// Hàm kiểm tra xử lý vector với KaTeX
const katex = require('katex');

// Định nghĩa các macro tương tự như trong LaTeXRenderer
const katexMacros = {
  // Các vector và mũi tên
  '\\vec': '\\overrightarrow{#1}',
  '\\vect': '\\overrightarrow{#1}',
  '\\overrightarrow': '\\overrightarrow{#1}',
};

// Các biểu thức vector cần kiểm tra
const testCases = [
  '$\\overrightarrow{v}=(-1;2;3)$',
  '$\\overrightarrow{v}=(-1,2,3)$',
  '$\\overrightarrow{v}=(-1;2;3)$',
  '$\\vec{v}=(-1;2;3)$',
  '$\\vec{v}=(-1,2,3)$',
  '$\\overrightarrow{v}$',
  '$\\vec{v}$',
  '$(-1;2;3)$',
  '$(-1,2,3)$',
];

// Thử render từng biểu thức
console.log('Kiểm tra render các biểu thức vector với KaTeX:');
console.log('==============================================');

testCases.forEach((formula, index) => {
  try {
    // Trích xuất nội dung trong dấu $...$
    const mathContent = formula.match(/\$(.*)\$/)[1];
    
    // Render với KaTeX
    const rendered = katex.renderToString(mathContent, {
      throwOnError: false,
      displayMode: false,
      output: 'html',
      macros: katexMacros,
      strict: false,
      trust: true,
    });
    
    console.log(`Test case ${index + 1}: ${formula}`);
    console.log('Kết quả: Render thành công');
    console.log('HTML output:', rendered);
    console.log('---');
  } catch (error) {
    console.log(`Test case ${index + 1}: ${formula}`);
    console.log('Kết quả: Lỗi khi render');
    console.log('Error:', error.message);
    console.log('---');
  }
});

// Kiểm tra xử lý dấu chấm phẩy
console.log('\nKiểm tra xử lý dấu chấm phẩy:');
console.log('============================');

const semicolonTests = [
  '$a;b$',
  '$a; b$',
  '$a ;b$',
  '$a ; b$',
  '$\\text{a;b}$',
  '$\\text{a; b}$',
  '$\\text{a ;b}$',
  '$\\text{a ; b}$',
];

semicolonTests.forEach((formula, index) => {
  try {
    // Trích xuất nội dung trong dấu $...$
    const mathContent = formula.match(/\$(.*)\$/)[1];
    
    // Render với KaTeX
    const rendered = katex.renderToString(mathContent, {
      throwOnError: false,
      displayMode: false,
      output: 'html',
      macros: katexMacros,
      strict: false,
      trust: true,
    });
    
    console.log(`Semicolon test ${index + 1}: ${formula}`);
    console.log('Kết quả: Render thành công');
    console.log('HTML output:', rendered);
    console.log('---');
  } catch (error) {
    console.log(`Semicolon test ${index + 1}: ${formula}`);
    console.log('Kết quả: Lỗi khi render');
    console.log('Error:', error.message);
    console.log('---');
  }
});

// Kiểm tra các cách viết vector khác nhau
console.log('\nKiểm tra các cách viết vector khác nhau:');
console.log('=====================================');

const vectorNotations = [
  '$\\overrightarrow{v} = (1, 2, 3)$',
  '$\\overrightarrow{v} = (1; 2; 3)$',
  '$\\overrightarrow{v} = (1 \\text{;} 2 \\text{;} 3)$',
  '$\\overrightarrow{v} = (1 \\text{,} 2 \\text{,} 3)$',
  '$\\overrightarrow{v} = (1\\text{;}2\\text{;}3)$',
  '$\\overrightarrow{v} = (1\\text{,}2\\text{,}3)$',
];

vectorNotations.forEach((formula, index) => {
  try {
    // Trích xuất nội dung trong dấu $...$
    const mathContent = formula.match(/\$(.*)\$/)[1];
    
    // Render với KaTeX
    const rendered = katex.renderToString(mathContent, {
      throwOnError: false,
      displayMode: false,
      output: 'html',
      macros: katexMacros,
      strict: false,
      trust: true,
    });
    
    console.log(`Vector notation test ${index + 1}: ${formula}`);
    console.log('Kết quả: Render thành công');
    console.log('HTML output:', rendered);
    console.log('---');
  } catch (error) {
    console.log(`Vector notation test ${index + 1}: ${formula}`);
    console.log('Kết quả: Lỗi khi render');
    console.log('Error:', error.message);
    console.log('---');
  }
});
