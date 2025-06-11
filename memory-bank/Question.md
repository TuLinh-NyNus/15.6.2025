Xây dựng cấu trúc Question như sau: (Các câu hỏi sẽ được định dạng dưới dạng mã Latex) 

# Định dạng câu hỏi
	Có 4 loại câu hỏi chính:
		1. Trắc nghiệm 1 phương án đúng (MC)
		2. Trắc nghiệm nhiều phương án đúng (TF)
		3. Trắc nghiệm trả lời ngắn (SA)
		4. Câu hỏi tự luận (ES)

## Câu hỏi có định dạng cơ bản như sau
	### 1. Trắc nghiệm 1 phương án đúng (MC)
	```tex
	\begin{ex}%[Nguồn: "Nguồn câu hỏi"] % Có thể có nhiều nguồn hoặc không có %[1P1V1-6] % QuestionID
		Lời dẫn câu hỏi
		\choice   % Có thể thay bằng \choice[1], \choice[2], \choice[4]
		{ đáp án 1}               % Đáp án sai
		{ đáp án 2}               % Đáp án sai
		{\True đáp án 3}         % Đáp án đúng
		{ đáp án 4}               % Đáp án sai
		Lời dẫn bổ sung (nếu có)
		\loigiai{
			Lời giải của câu hỏi
		}
	\end{ex}
	```
	
	### 2. Trắc nghiệm nhiều phương án đúng (TF)
	```tex
	\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
		Lời dẫn câu hỏi
		\choiceTF   % Có thể thay bằng \choiceTF[t], \choiceTFt, \choiceTF[1]
		{\True đáp án 1}         % Đáp án đúng
		{ đáp án 2}              % Đáp án sai
		{\True đáp án 3}         % Đáp án đúng
		{ đáp án 4}              % Đáp án sai
		Lời dẫn bổ sung (nếu có)
		\loigiai{
			Lời giải của câu hỏi
		}
	\end{ex}
	```
	
	### 3. Trắc nghiệm trả lời ngắn (SA)
	```tex
	\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
		Lời dẫn câu hỏi
		\shortans{'đáp án'}      % hoặc \shortans[oly]{'đáp án'}
		\loigiai{
			Lời giải của câu hỏi
		}
	\end{ex}
	```
	
	### 4. Câu hỏi tự luận (ES)
	```tex
	\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
		Nội dung câu hỏi tự luận
		\loigiai{
			Lời giải của câu hỏi
		}
	\end{ex}
	```
	
	Định dạng 1 cột 
	\begin{ex}% %các metadata
		[XX.Y] %subcount
		Nội dung câu hỏi...
		\begin{center}
			Phần hình ảnh (tikzpicture hoặc includegraphics)
		\end{center}
		Nội dung khác...
		\loigiai{
			Phần giải...
		}
	\end{ex}
	
	\begin{ex}% %các metadata
		[XX.Y] %subcount
		\immini[thm]  %[thm] có thể không có 
		{Nội dung câu hỏi...}
		{Phần hình ảnh}
		Nội dung khác...
		\loigiai{
			Phần giải...
		}
	\end{ex}
	
## Câu hỏi có hình ảnh minh họa có định dạng 2 loại 1 cột và 2 cột(có \immini[thm]{}{})
	### 1. Định dạng câu hỏi Trắc nghiệm 1 phương án đúng (MC)
		- Với định dạng '1 cột'
			\begin{ex}% %các metadata
				[XX.Y] %subcount
				Nội dung câu hỏi...
				\begin{center}
					Phần hình ảnh (tikzpicture hoặc includegraphics)
				\end{center}
				\choice[1]  %[1], [2], [3], [4] có thể không có
				{ Đáp án 1 }
				{ Đáp án 2 }
				{\True Đáp án đúng }
				{ Đáp án 4 }
				Nội dung khác...
				\loigiai{
					Phần giải...
				}
			\end{ex}
		- Với định dạng '2 cột' 
			\begin{ex}% %các metadata
				[XX.Y] %subcount
				\immini[thm]  %[thm] có thể không có 
				{Nội dung câu hỏi... %xuống dòng
					\choice[1]  %[1], [2], [3], [4] có thể không có
					{ Đáp án 1 }
					{ Đáp án 2 }
					{\True Đáp án đúng }
					{ Đáp án 4 }}
				{ Phần hình ảnh (tikzpicture hoặc includegraphics)}
				\loigiai{
					Phần giải...
				}
			\end{ex}
	
	2. Định dạng câu hỏi Trắc nghiệm Đúng - Sai (TF)
	- Với định dạng '1 cột'
		\begin{ex}% %các metadata
			[XX.Y] %subcount
			Nội dung câu hỏi...
			\begin{center}
				Phần hình ảnh (tikzpicture hoặc includegraphics)
			\end{center}
			\choiceTF[t]  %[t], [1], [2], t có thể không có
			{\True Đáp án đúng}
			{ Đáp án 2}
			{\True Đáp án đúng}
			{ Đáp án 4}
			Nội dung khác...
			\loigiai{
				Phần giải...
			}
		\end{ex}
	- Với định dạng '2 cột' 
		\begin{ex}% %các metadata
			[XX.Y] %subcount
			\immini[thm]  %[thm] có thể không có 
			{Nội dung câu hỏi... %xuống dòng
				\choiceTF[t]  %[t], [1], [2], t có thể không có
				{\True Đáp án đúng}
				{ Đáp án 2}
				{\True Đáp án đúng}
				{ Đáp án 4}}
			{ Phần hình ảnh (tikzpicture hoặc includegraphics)}
			\loigiai{
				Phần giải...
			}
		\end{ex}
	
	3. Định dạng Trắc nghiệm trả lời ngắn (SA)
	- Với định dạng '1 cột'
		\begin{ex}% %các metadata
			[XX.Y] %subcount
			Nội dung câu hỏi...
			\begin{center}
				Phần hình ảnh (tikzpicture hoặc includegraphics)
			\end{center}
			\shortans[oly]{'Câu trả lời đúng'} %[oly] có thể không có
			\loigiai{
				Phần giải...
			}
		\end{ex}
	- Với định dạng '2 cột' 
		\begin{ex}% %các metadata
			[XX.Y] %subcount
			\immini[thm]  %[thm] có thể không có 
			{Nội dung câu hỏi...%xuống dòng
				\shortans[oly]{'Câu trả lời đúng'} %[oly] có thể không có}
			{Phần hình ảnh (tikzpicture hoặc includegraphics)}
			\loigiai{
				Phần giải...
			}
		\end{ex}
	
	4. Định dạng Câu hỏi tự luận (ES)
	- Với định dạng '1 cột'
		\begin{ex}% %các metadata
			[XX.Y] %subcount
			Nội dung câu hỏi...
			\begin{center}
				Phần hình ảnh (tikzpicture hoặc includegraphics)
			\end{center}
			\loigiai{
				Phần giải...
			}
		\end{ex}
	- Với định dạng '2 cột' 
		\begin{ex}% %các metadata
			[XX.Y] %subcount
			\immini[thm]  %[thm] có thể không có 
			{Nội dung câu hỏi...}
			{Phần hình ảnh (tikzpicture hoặc includegraphics)}
			\loigiai{
				Phần giải...
			}
		\end{ex}


# Các trường quản lí
	1. RawContent: Nội dung gốc LaTex của câu hỏi
	2. QuestionID: Mục đích dùng để phân loại câu hỏi thành các thành tố như lớp, môn, chương, mức độ, bài, dạng
		Nếu là ID5 sẽ theo định đạng: %[Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5].
		Nếu là ID6 sẽ theo định đạng: %[Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5 - Tham số 6].
			Chú ý: 
				Có thể thay đổi nội dung của mức độ nhưng vị trí của mức độ trong ID không đổi (thông số thứ 3 từ trái qua).
				Cú pháp của thông số: [Giá trị] Mô tả thông số. 
				Các dấu gạch ngang không được thay đổi.
		Cấu hình tên các tham số
			Tên tham số 1: Lớp		(Grade)
			Tên tham số 2: Môn		(Subject)
			Tên tham số 3: Chương	(Chapter)
			Tên tham số 4: Mức độ	(Level)
			Tên tham số 5: Bài		(Lesson)
			Tên tham số 6: Dạng		(Form) (chỉ có trong ID6)
		Cấu hình mức độ dùng chung.
			[N] Nhận biết
			[H] Thông Hiểu
			[V] VD
			[C] VD Cao
			[T] VIP
			[M] Note
		Cấu hình Lớp, Môn, Chương, Bài, Dạng được hiểu qua cây thư mục của MapID như sau"
			-[0] Lớp 10                                                     (Đây chính là Lớp của câu hỏi)
			----[P] 10-NGÂN HÀNG CHÍNH										(Đây chính là Môn của câu hỏi)
			-------[1] Mệnh đề và tập hợp									(Đây chính là Bài của câu hỏi)
			----------[1] Mệnh đề											(Đây chính là lớp của câu hỏi)
			-------------[1] Xác định mệnh đề, mệnh đề chứa biến			(Đây chính là dạng của câu hỏi)
		Ví dụ: [2H5V3-2]
		Ngoại trừ tham số thứ 4 là chúng ta dò thông qua cấu hình mức độ dùng chung, tất cả 5 tham số còn lại phải dò thông qua MapID 
		Lưu ý QuestionID [XXXXX-X] các kí tự X sẽ là 1 kí tự số [0-9] hoặc kí tự chữ cái in hoa [A-Z]
	 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
	 	Định dạng Subcount: `[XX.N]`
	 	- Ví dụ: `[TL.100022]`
	 	- Thành phần:
		 	- Tiền tố (TL: Tú Linh)
		 	- Số thứ tự (100022)
	 	Lưu ý: XX là 2 kí tự in hoa [A-Z] và N là số có thể có nhiều chữ số
	 4. Type: Loại câu hỏi (MC, TF, SA, ES)
		Được biết như sau:
			Câu hỏi trắc nghiệm đúng sai (TF) trong câu hỏi sẽ có \choiceTF hoặc \choiceTF[t] \choiceTFt  					(nói chung nếu nó có đủ \choiceTF thì là câu TF)
			Câu hỏi trắc nghiệm một phương án đúng (MC) trong câu hỏi sẽ có \choice hoặc \choice[1] hoặc \choice[2] 		(nói chung nếu nó có đủ \choice khác với \choiceTF nhé (vì thế nên cẩn thận nhầm lẫn giữa hai loại câu hỏi này nhé) thì là câu TF)
			Câu hỏi trắc nghiệm trả lời ngắn (TF) trong câu hỏi sẽ có \shortans  hoặc \shortans[oly] hoặc \shortans[0]      (nói chung nếu nó có đủ \shortans thì là câu SA)
			Câu hỏi trắc nghiệm ghép đôi (MA) trong câu hỏi sẽ có \matching
			Nếu không có 3 yếu tố trên sẽ là câu hỏi tự luận ES
	5. Source: Nguồn câu hỏi
		Được xác định bằng cách xác định [Nguồn: 'Nguồn câu hỏi'] và lấy nội dung 'Nguồn câu hỏi'
	6. Content: Nội dung câu hỏi đã xử lý 
		Cách ta trích xuất theo tiến trình như sau:
			1. Lấy toàn bộ nội dung trong \begin{ex}   .....   \end{ex}
			2. Loại bỏ QuestionID, Source và Subcount của câu hỏi
			3. Loại bỏ thành tố immini... (định dạng cột 2)
			4. Loại bỏ định dạng môi trường chèn hình 
					Loại bỏ \begin{tikzpicture}... \end{tikzpicture}
					Loại bỏ \inclugraphic[...]{...}
			5. Loại bỏ đáp án
				Với câu hỏi MC và TF thì loại bỏ 
				\choice   
				{đáp án 1}               % Đáp án sai
				{đáp án 2}               % Đáp án sai
				{\True đáp án 3}         % Đáp án đúng
				{đáp án 4}               % Đáp án sai
				hoặc 
				\choiceTF   
				{\True đáp án 1}         % Đáp án đúng
				{đáp án 2}               % Đáp án sai
				{\True đáp án 3}         % Đáp án đúng
				{đáp án 4}               % Đáp án sai
				Với câu hỏi SA thì loại bỏ \shortans{}
			6. Phần còn lại chính là Content của câu hỏi (Ở phía dưới có code tham khảo trích xuất bạn có thể tham khảo sau đó cải tiến)
	7. Answers: Danh sách đáp án của câu hỏi để chọn
		Đối với 2 loại câu hỏi MC và TF thì hiện tại có các câu trả lời ta sẽ lưu ở đây thành mảng
		Đối với 2 loại câu hỏi SA và ES thì không có danh sách các đáp án để chọn (để trống 'null' á)
		Đối với câu hỏi MA thì hiện tại chưa có cách trích xuất được (để trống 'null' á)
	8. CorrectAnswer: Đáp án đúng
		Đối với loại câu hỏi MC thì đáp án đúng sẽ phần phía sau \True, một câu hỏi chỉ có một đáp án đúng
			\choice   
				{đáp án 1}               % Đáp án sai
				{đáp án 2}               % Đáp án sai
				{\True đáp án 3}         % Đáp án đúng
				{đáp án 4}               % Đáp án sai
		Đối với loại câu hỏi TF thì đáp án đúng sẽ phần phía sau \True, tuy nhiên thì một câu hỏi có thể có nhiều đáp án đúng hoặc không có đáp án đúng nào
			\choiceTF   
				{\True đáp án 1}         % Đáp án đúng
				{đáp án 2}               % Đáp án sai
				{\True đáp án 3}         % Đáp án đúng
				{đáp án 4}               % Đáp án sai
		Đối với câu hỏi SA thì đáp đúng nằm trong đây \shortans{'Đáp án đúng sẽ nằm ở đây'}
	9. Solution: Lời giải câu hỏi (có thể có hoặc không)
		Được xác định bằng cách xác định \loigiai{'Lời giải cho câu hỏi ở đây'} và lấy nội dung 'Lời giải cho câu hỏi ở đây'
	
	10. Images: Danh sách hình ảnh
		Sẽ là đường dẫn đến cloud chứa hình ảnh của câu hỏi
			-Image.Ques: Hình của của chỉ câu hỏi
			-Image.Sol:  Hình ảnh của câu hỏi và lời giải của nó.
	11. Tags: Nhãn phân loại
	12. UsageCount`: Số lần sử dụng
	13. Creator: Thông tin người tạo: Mặc định là admin
	14. Status: Trạng thái câu hỏi: Đang hoạt động; Câu hỏi chờ kiểm tra
	15. ExamRefs: Tham chiếu đến các bài kiểm tra
		Mã này sẽ tham chiếu đến các mã của các bài kiểm tra
	16. Feedback: Sẽ tính số lần câu hỏi này được feedback

# Module trích xuất (Đây chỉ là gợi ý ban đầu)
## Module trích xuất dấu ngoặc: Một trong những thách thức lớn khi xử lý cú pháp LaTeX là trích xuất chính xác nội dung bên trong các cặp dấu ngoặc. Module `BracketExtractor` được phát triển đặc biệt để giải quyết vấn đề này:
```typescript
class BracketExtractor {
	/**
	* Trích xuất nội dung bên trong cặp ngoặc nhọn đầu tiên từ một chuỗi
	* @param content Chuỗi cần trích xuất
	* @param startIndex Vị trí bắt đầu tìm kiếm (mặc định là 0)
	* @returns Object chứa nội dung trích xuất và vị trí kết thúc, hoặc null nếu không tìm thấy
	*/
	static extractFirstCurlyBrackets(
	content: string,
	startIndex = 0,
	): { content: string; endIndex: number } | null {
		// Tìm vị trí mở ngoặc đầu tiên
		const openIndex = content.indexOf('{', startIndex);
			if (openIndex === -1) return null;
			
			let nestedLevel = 1;
			let currentIndex = openIndex + 1;
			
			// Duyệt qua chuỗi để tìm ngoặc đóng tương ứng
			while (currentIndex < content.length && nestedLevel > 0) {
				const char = content[currentIndex];
				
				if (char === '{') {
						nestedLevel++;
					} else if (char === '}') {
					nestedLevel--;
				}
				
				currentIndex++;
			}
			
			// Kiểm tra xem đã tìm thấy ngoặc đóng chưa
			if (nestedLevel !== 0) {
				console.warn('Không tìm thấy ngoặc đóng tương ứng');
				return null;
			}
			
			// Trích xuất nội dung (không bao gồm dấu ngoặc)
			const extractedContent = content.substring(openIndex + 1, currentIndex - 1);
			
			return {
				content: extractedContent,
				endIndex: currentIndex,
			};
		}
		
		/**
		* Trích xuất tất cả nội dung bên trong các cặp ngoặc nhọn từ một chuỗi
		* @param content Chuỗi cần trích xuất
		* @returns Mảng các chuỗi đã trích xuất
		*/
		static extractAllCurlyBrackets(content: string): string[] {
			const results: string[] = [];
			let currentIndex = 0;
			let extraction = this.extractFirstCurlyBrackets(content, currentIndex);
			
			while (extraction !== null) {
				results.push(extraction.content);
				currentIndex = extraction.endIndex;
				extraction = this.extractFirstCurlyBrackets(content, currentIndex);
			}
			
			return results;
		}
		
		/**
		* Trích xuất nội dung bên trong cặp ngoặc vuông đầu tiên
		* @param content Chuỗi cần trích xuất
		* @param startIndex Vị trí bắt đầu tìm kiếm (mặc định là 0)
		* @returns Object chứa nội dung trích xuất và vị trí kết thúc, hoặc null nếu không tìm thấy
		*/
		static extractFirstSquareBrackets(
		content: string,
		startIndex = 0,
		): { content: string; endIndex: number } | null {
			const openIndex = content.indexOf('[', startIndex);
			if (openIndex === -1) return null;
			
			let nestedLevel = 1;
			let currentIndex = openIndex + 1;
			
			while (currentIndex < content.length && nestedLevel > 0) {
				const char = content[currentIndex];
				
				if (char === '[') {
					nestedLevel++;
				} else if (char === ']') {
					nestedLevel--;
				}
				
				currentIndex++;
			}
			
			if (nestedLevel !== 0) {
				console.warn('Không tìm thấy ngoặc vuông đóng tương ứng');
				return null;
			}
			
			const extractedContent = content.substring(openIndex + 1, currentIndex - 1);
			
			return {
				content: extractedContent,
				endIndex: currentIndex,
			};
		}
		
		/**
		* Trích xuất nội dung bên trong cặp dấu ngoặc tròn đầu tiên
		* @param content Chuỗi cần trích xuất
		* @param startIndex Vị trí bắt đầu tìm kiếm (mặc định là 0)
		* @returns Object chứa nội dung trích xuất và vị trí kết thúc, hoặc null nếu không tìm thấy
		*/
		static extractFirstParentheses(
		content: string,
		startIndex = 0,
		): { content: string; endIndex: number } | null {
			const openIndex = content.indexOf('(', startIndex);
			if (openIndex === -1) return null;
			
			let nestedLevel = 1;
			let currentIndex = openIndex + 1;
			
			while (currentIndex < content.length && nestedLevel > 0) {
				const char = content[currentIndex];
				
				if (char === '(') {
					nestedLevel++;
				} else if (char === ')') {
					nestedLevel--;
				}
				
				currentIndex++;
			}
			
			if (nestedLevel !== 0) {
				console.warn('Không tìm thấy ngoặc tròn đóng tương ứng');
				return null;
			}
			
			const extractedContent = content.substring(openIndex + 1, currentIndex - 1);
			
			return {
				content: extractedContent,
				endIndex: currentIndex,
			};
		}
		
		/**
		* Trích xuất nội dung bên trong cặp dấu ngoặc cho một môi trường LaTeX cụ thể
		* @param content Chuỗi cần trích xuất
		* @param environment Tên môi trường LaTeX
		* @returns Nội dung đã trích xuất hoặc null nếu không tìm thấy
		*/
		static extractEnvironmentContent(content: string, environment: string): string | null {
			const startTag = `\\begin{${environment}}`;
			const endTag = `\\end{${environment}}`;
			
			const startPos = content.indexOf(startTag);
			if (startPos === -1) return null;
			
			const startContentPos = startPos + startTag.length;
			const endPos = content.indexOf(endTag, startContentPos);
			if (endPos === -1) return null;
			
			return content.substring(startContentPos, endPos).trim();
		}
	}
	```
	
	Module này được sử dụng rộng rãi trong parser để:
	
	1. **Trích xuất nội dung trong môi trường `ex`**:
	
	```typescript
	const exContent = BracketExtractor.extractEnvironmentContent(rawContent, 'ex');
	```
	
	2. **Trích xuất đáp án trong môi trường `choice`**:
	
	```typescript
	const answers = BracketExtractor.extractAllCurlyBrackets(choiceContent);
	```
	
	3. **Trích xuất QuestionID**:
	
	```typescript
	const idMatch = raw_content.match(/\[(.*?)\]/);
	if (idMatch) {
		const questionId = idMatch[1];
		// Xử lý tiếp...
	}
	```
	
	4. **Trích xuất lời giải**:
	```typescript
	const solutionContent = BracketExtractor.extractFirstCurlyBrackets(content, solutionStartPos);
	```
Việc sử dụng module này đảm bảo rằng nội dung được trích xuất chính xác ngay cả khi có các cấu trúc lồng nhau phức tạp trong LaTeX, điều rất phổ biến trong các câu hỏi toán học với nhiều công thức và biểu thức.

## Code trích xuất câu hỏi

```typescript
static parseQuestion(raw_content: string): Question | null {
	try {
		// Bước 1: Phân tích ID và nguồn
		const idMatch = raw_content.match(ID_PATTERN);
		const sourceMatches = Array.from(raw_content.matchAll(SOURCE_PATTERN));
		
		// Trích xuất QuestionID
		let questionId = null;
		if (idMatch && idMatch[1]) {
			questionId = this.parseQuestionId(idMatch[1]);
		}
		
		// Trích xuất Subcount
		let subcount = null;
		for (const pattern of SUBCOUNT_PATTERNS) {
			const subcountMatch = raw_content.match(pattern);
			if (subcountMatch && subcountMatch[1] && subcountMatch[2]) {
				subcount = {
					prefix: subcountMatch[1],
					number: subcountMatch[2],
					fullId: `${subcountMatch[1]}.${subcountMatch[2]}`
				};
				break;
			}
		}
		
		// Trích xuất danh sách nguồn
		const sources = [];
		if (sourceMatches.length > 0) {
			for (const match of sourceMatches) {
				if (match[1] || match[2]) {
					sources.push(match[1] || match[2]);
				}
			}
		}
		
		// Bước 2: Xử lý nội dung - Tìm nội dung bên trong \begin{ex}...\end{ex}
		const startTag = '\\begin{ex}';
		const endTag = '\\end{ex}';
		
		const startPos = raw_content.indexOf(startTag) + startTag.length;
		const endPos = raw_content.lastIndexOf(endTag);
		
		if (startPos === -1 || endPos === -1 || startPos >= endPos) {
			console.error('Invalid question format');
			return null;
		}
		
		const innerContent = raw_content.substring(startPos, endPos).trim();
		
		// Bước 3: Xử lý hình ảnh và loại bỏ môi trường đặc biệt
		let contentWithoutImages = innerContent;
		
		// Loại bỏ các môi trường hình ảnh
		for (const pattern of IMAGE_ENVIRONMENTS) {
			contentWithoutImages = contentWithoutImages.replace(new RegExp(pattern, 'g'), '');
		}
		
		// Tìm tất cả các lời giải
		const solutionMatches = Array.from(contentWithoutImages.matchAll(new RegExp(SOLUTION_PATTERN, 'g')));
		const solutions = [];
		
		let contentWithoutSolution = contentWithoutImages;
		
		if (solutionMatches.length > 0) {
			// Trích xuất tất cả lời giải
			for (const match of solutionMatches) {
				const solution = this.extractSolution(match[0]);
				if (solution) {
					solutions.push(solution);
				}
			}
			
			// Loại bỏ tất cả lời giải khỏi nội dung
			contentWithoutSolution = contentWithoutImages;
			for (const match of solutionMatches) {
				contentWithoutSolution = contentWithoutSolution.replace(match[0], '');
			}
		}
		
		// Bước 4: Trích xuất đáp án từ nội dung đã xử lý
		const choiceMatch = contentWithoutSolution.match(/\\choice(?:\[[0-9]\])?|\\choiceTF(?:\[[t]\])?|\\shortans(?:\[[a-z]+\])?/);
		const choicePos = choiceMatch && choiceMatch.index !== undefined ? choiceMatch.index : -1;
		
		let questionContent = contentWithoutSolution;
		let answerContent = '';
		
		if (choicePos !== -1) {
			questionContent = contentWithoutSolution.substring(0, choicePos).trim();
			answerContent = contentWithoutSolution.substring(choicePos);
		}
		
		// Phân loại câu hỏi và trích xuất đáp án
		const [questionType, answers, correctAnswers] = this.identifyQuestionType(contentWithoutSolution);
		
		// Làm sạch nội dung câu hỏi
		const finalContent = questionContent
		.replace(/\s+/g, ' ')
		.trim();
		
		// Tạo đối tượng Question
		const mappedType = questionType as keyof typeof QUESTION_TYPE_MAP;
		const question: Question = {
			raw_content,
			type: QUESTION_TYPE_MAP[mappedType] as any,
			content: finalContent,
			correct_answer: correctAnswers,
		}
		
		if (questionId) {
			question.question_id = questionId
		}
		
		if (subcount) {
			question.subcount = subcount
		}
		
		if (sources.length > 0) {
			question.sources = sources
		}
		
		if (solutions.length > 0) {
			question.solutions = solutions
		}
		
		if (answers && answers.length > 0) {
			question.answers = answers
		}
		
		return question
		
	} catch (error) {
		console.error("Error parsing question:", error)
		return null
	}
}
```

# Lọc câu hỏi: (Lên kế hoạch xây dựng)
	Ta sẽ lọc câu hỏi thông qua các tham số của QuestionID, Subcount, Tags và Type của câu hỏi và có thể lọc nâng cao bằng cách tìm những từ có trong câu hỏi

# Xây dựng song ánh để hiện được ý nghĩa của các tham số của QuestionID thông qua MapID
		Nếu là ID5 sẽ theo định đạng: %[Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5].
		Nếu là ID6 sẽ theo định đạng: %[Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5 - Tham số 6].
			Chú ý: 
				Có thể thay đổi nội dung của mức độ nhưng vị trí của mức độ trong ID không đổi (thông số thứ 3 từ trái qua).
				Cú pháp của thông số: [Giá trị] Mô tả thông số. 
				Các dấu gạch ngang không được thay đổi.
		Cấu hình tên các tham số
			Tên tham số 1: Lớp		(Grade)
			Tên tham số 2: Môn		(Subject)
			Tên tham số 3: Chương	(Chapter)
			Tên tham số 4: Mức độ	(Level)
			Tên tham số 5: Bài		(Lesson)
			Tên tham số 6: Dạng		(Form) (chỉ có trong ID6)
		Cấu hình mức độ dùng chung.
			[N] Nhận biết
			[H] Thông Hiểu
			[V] VD
			[C] VD Cao
			[T] VIP
			[M] Note
		Cấu hình Lớp, Môn, Chương, Bài, Dạng được hiểu qua cây thư mục của MapID như sau"
			-[0] Lớp 10                                                     (Đây chính là Lớp của câu hỏi)
			----[P] 10-NGÂN HÀNG CHÍNH										(Đây chính là Môn của câu hỏi)
			-------[1] Mệnh đề và tập hợp									(Đây chính là Bài của câu hỏi)
			----------[1] Mệnh đề											(Đây chính là lớp của câu hỏi)
			-------------[1] Xác định mệnh đề, mệnh đề chứa biến			(Đây chính là lớp của câu hỏi)
		Ví dụ: [2H5V3-2]
		Ngoại trừ tham số thứ 4 là chúng ta dò thông qua cấu hình mức độ dùng chung, tất cả 5 tham số còn lại phải dò thông qua MapID 
		Lưu ý QuestionID [XXXXX-X] các kí tự X sẽ là 1 kí tự số [0-9] hoặc kí tự chữ cái in hoa [A-Z]