# Hướng dẫn sử dụng Template Câu hỏi

Tài liệu này cung cấp hướng dẫn chi tiết về cách sử dụng các template câu hỏi trong hệ thống.

## Cấu trúc chung của câu hỏi

Tất cả các câu hỏi đều được đặt trong môi trường `\begin{ex}...\end{ex}` và có cấu trúc chung như sau:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[XXXXX-X] %QuestionID
[XX.Y] %subcount (tùy chọn)
Nội dung câu hỏi
... (Phần đặc thù của từng loại câu hỏi)
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

### Metadata của câu hỏi

- **Nguồn**: `%[Nguồn: "Tên nguồn"]` - Chỉ định nguồn của câu hỏi
- **QuestionID**: `%[XXXXX-X]` - Mã định danh của câu hỏi, tuân theo cấu trúc:
  - ID5: `[Lớp-Môn-Chương-Mức độ-Bài]`
  - ID6: `[Lớp-Môn-Chương-Mức độ-Bài-Dạng]`
- **Subcount**: `[XX.Y]` - Mã phụ của câu hỏi, thường dùng để đánh dấu câu hỏi con

## Các loại câu hỏi

### 1. Trắc nghiệm một phương án đúng (MC)

Sử dụng lệnh `\choice` để tạo câu hỏi trắc nghiệm một phương án đúng:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
Lời dẫn câu hỏi
\choice   % Có thể thay bằng \choice[1], \choice[2], \choice[4]
{ đáp án 1}               % Đáp án sai
{ đáp án 2}               % Đáp án sai
{\True đáp án 3}         % Đáp án đúng
{ đáp án 4}               % Đáp án sai
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

Các tùy chọn của `\choice`:
- `\choice[1]`: Hiển thị đáp án theo 1 cột
- `\choice[2]`: Hiển thị đáp án theo 2 cột
- `\choice[4]`: Hiển thị đáp án theo 4 cột

Đáp án đúng được đánh dấu bằng `\True` đặt trước nội dung đáp án.

### 2. Trắc nghiệm nhiều phương án đúng (TF)

Sử dụng lệnh `\choiceTF` để tạo câu hỏi trắc nghiệm nhiều phương án đúng:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
Lời dẫn câu hỏi
\choiceTF   % Có thể thay bằng \choiceTF[t], \choiceTFt, \choiceTF[1]
{\True đáp án 1}         % Đáp án đúng
{ đáp án 2}              % Đáp án sai
{\True đáp án 3}         % Đáp án đúng
{ đáp án 4}              % Đáp án sai
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

Các tùy chọn của `\choiceTF`:
- `\choiceTF[t]`: Hiển thị đáp án với định dạng đặc biệt
- `\choiceTFt`: Tương tự `\choiceTF[t]`
- `\choiceTF[1]`: Hiển thị đáp án theo 1 cột
- `\choiceTF[2]`: Hiển thị đáp án theo 2 cột

Đáp án đúng được đánh dấu bằng `\True` đặt trước nội dung đáp án.

### 3. Trắc nghiệm trả lời ngắn (SA)

Sử dụng lệnh `\shortans` để tạo câu hỏi trả lời ngắn:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
Lời dẫn câu hỏi
\shortans{'đáp án'}      % hoặc \shortans[oly]{'đáp án'}
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

Các tùy chọn của `\shortans`:
- `\shortans[oly]`: Hiển thị đáp án với định dạng Olympic
- `\shortans[số]`: Hiển thị ô trả lời với độ rộng được chỉ định

Đáp án đúng được đặt trong dấu ngoặc đơn `'đáp án'`.

### 4. Câu hỏi tự luận (ES)

Câu hỏi tự luận không cần lệnh đặc biệt, chỉ cần nội dung câu hỏi:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
Lời dẫn câu hỏi tự luận
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

### 5. Câu hỏi ghép đôi (MA)

Sử dụng lệnh `\matching` để tạo câu hỏi ghép đôi:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
Lời dẫn câu hỏi ghép đôi
\matching
{Mục A1} {Mục B1}
{Mục A2} {Mục B2}
{Mục A3} {Mục B3}
{Mục A4} {Mục B4}
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

## Bố cục câu hỏi

### 1. Bố cục một cột

Đây là bố cục mặc định, với nội dung câu hỏi và đáp án được hiển thị theo một cột.

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
Lời dẫn câu hỏi
\begin{center}
    \begin{tikzpicture}
        % Mã vẽ hình ở đây
    \end{tikzpicture}
\end{center}
\choice
{ đáp án 1}
{ đáp án 2}
{\True đáp án 3}
{ đáp án 4}
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

### 2. Bố cục hai cột

Sử dụng lệnh `\immini` để tạo bố cục hai cột, với nội dung câu hỏi ở bên trái và hình ảnh ở bên phải:

```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"] %[1P1V1-6]
\immini[thm]  %[thm] có thể không có
{Lời dẫn câu hỏi
\choice
{ đáp án 1}
{ đáp án 2}
{\True đáp án 3}
{ đáp án 4}}
{\begin{tikzpicture}
    % Mã vẽ hình ở đây
\end{tikzpicture}}
\loigiai{
    Lời giải của câu hỏi
}
\end{ex}
```

Tham số `[thm]` là tùy chọn và có thể được bỏ qua.

## Các lệnh đặc biệt

### 1. Lệnh `\hoac` và `\heva`

Lệnh `\hoac` và `\heva` được sử dụng để tạo các hệ phương trình hoặc biểu thức:

```latex
\hoac{
  x + y = 1 \\
  x - y = 2
}

\heva{
  x + y = 1 \\
  x - y = 2
}
```

Lệnh `\hoac` sử dụng dấu ngoặc vuông `[...]`, trong khi `\heva` sử dụng dấu ngoặc nhọn `{...}`.

### 2. Lệnh `\ck`

Lệnh `\ck` được sử dụng để thêm cách giải khác:

```latex
\ck{
  Nội dung cách giải khác
}
```

### 3. Lệnh `\vec`

Lệnh `\vec` được sử dụng để tạo vector:

```latex
\vec{AB}
```

## Các công thức toán học thường dùng

### 1. Phân số

```latex
\frac{tử số}{mẫu số}
```

### 2. Căn thức

```latex
\sqrt{biểu thức}
\sqrt[n]{biểu thức} % Căn bậc n
```

### 3. Chỉ số và số mũ

```latex
a^{số mũ}
a_{chỉ số}
```

### 4. Tích phân

```latex
\int_{cận dưới}^{cận trên} biểu thức \, dx
```

### 5. Đạo hàm

```latex
\frac{d}{dx}f(x)
\frac{d^2}{dx^2}f(x)
```

### 6. Giới hạn

```latex
\lim_{x \to a} f(x)
```

### 7. Tổng và tích

```latex
\sum_{i=1}^{n} a_i
\prod_{i=1}^{n} a_i
```

### 8. Ma trận

```latex
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{bmatrix} a & b \\ c & d \end{bmatrix}
```

### 9. Hệ phương trình

```latex
\begin{cases}
  x + y = 1 \\
  x - y = 2
\end{cases}
```

## Lưu ý quan trọng

1. Đảm bảo rằng mỗi câu hỏi đều có QuestionID đúng định dạng.
2. Đáp án đúng trong câu hỏi trắc nghiệm phải được đánh dấu bằng `\True`.
3. Đáp án trong câu hỏi trả lời ngắn phải được đặt trong dấu ngoặc đơn `'đáp án'`.
4. Lời giải của câu hỏi phải được đặt trong lệnh `\loigiai{...}`.
5. Khi sử dụng bố cục hai cột với `\immini`, đảm bảo rằng nội dung bên trái và bên phải được đặt trong dấu ngoặc nhọn `{...}`.
