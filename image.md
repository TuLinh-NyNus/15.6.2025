# Quy trình tạo và quản lý ảnh cho hệ thống 300.000 câu hỏi kiểm tra

## Mục lục
- [1. Tạo ảnh từ nội dung câu hỏi](#1-tạo-ảnh-từ-nội-dung-câu-hỏi)
- [2. Tải ảnh lên Google Drive](#2-tải-ảnh-lên-google-drive)
- [3. Tổ chức và đặt tên file](#3-tổ-chức-và-đặt-tên-file)
- [4. Tích hợp ảnh vào website kiểm tra](#4-tích-hợp-ảnh-vào-website-kiểm-tra)
- [5. Bảo vệ ảnh khỏi tải xuống trái phép](#5-bảo-vệ-ảnh-khỏi-tải-xuống-trái-phép)
- [6. Tối ưu hiệu suất](#6-tối-ưu-hiệu-suất)
- [7. Bảo trì và quản lý dài hạn](#7-bảo-trì-và-quản-lý-dài-hạn)

## 1. Tạo ảnh từ nội dung câu hỏi

> **Lưu ý**: Phần này đã được thực hiện và sẽ được cập nhật sau bởi người phát triển.

<!-- Phần nội dung bên dưới sẽ được cập nhật sau khi hoàn thiện quy trình hiện tại -->


## 2. Tải ảnh lên Google Drive

### 2.1 Thiết lập xác thực Google Drive API

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def setup_drive_service():
    # Sử dụng Service Account để xác thực (khuyến nghị cho ứng dụng máy chủ)
    credentials = service_account.Credentials.from_service_account_file(
        'service-account-key.json',
        scopes=['https://www.googleapis.com/auth/drive']
    )

    return build('drive', 'v3', credentials=credentials)
```

### 2.2 Tạo cấu trúc thư mục trên Google Drive

```python
def create_folder_structure(drive_service):
    # Tạo thư mục gốc
    root_folder = create_folder_if_not_exists(drive_service, 'Question Images', None)

    # Tạo thư mục cho từng môn học
    subjects = ['Math', 'Physics', 'Chemistry', 'Biology']
    subject_folders = {}

    for subject in subjects:
        subject_folder = create_folder_if_not_exists(drive_service, subject, root_folder)
        subject_folders[subject] = subject_folder

        # Tạo thư mục cho từng lớp
        for grade in range(10, 13):
            grade_folder = create_folder_if_not_exists(
                drive_service, f'Grade {grade}', subject_folder)

            # Tạo thư mục cho từng chương
            for chapter in range(1, 11):
                create_folder_if_not_exists(
                    drive_service, f'Chapter {chapter}', grade_folder)

    return subject_folders

def create_folder_if_not_exists(drive_service, folder_name, parent_id):
    # Kiểm tra xem thư mục đã tồn tại chưa
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = drive_service.files().list(q=query).execute()
    items = results.get('files', [])

    if items:
        return items[0]['id']
    else:
        # Tạo thư mục mới
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_id:
            file_metadata['parents'] = [parent_id]

        folder = drive_service.files().create(
            body=file_metadata, fields='id').execute()
        return folder.get('id')
```

### 2.3 Tải ảnh lên với metadata

```python
def upload_image(drive_service, image_path, parent_folder_id, metadata):
    # Chuẩn bị metadata
    file_metadata = {
        'name': os.path.basename(image_path),
        'parents': [parent_folder_id],
        'properties': {
            'questionId': metadata['id'],
            'subject': metadata['subject'],
            'grade': metadata['grade'],
            'chapter': metadata['chapter'],
            'level': metadata['level']
        }
    }

    # Tải lên file
    media = MediaFileUpload(
        image_path,
        mimetype='image/png',
        resumable=True  # Cho phép tải lên tiếp tục nếu bị gián đoạn
    )

    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id,webViewLink'
    ).execute()

    return file
```

## 3. Tổ chức và đặt tên file

### 3.1 Quy ước đặt tên file

Sử dụng quy ước đặt tên nhất quán để dễ dàng quản lý:

```
[MÔN]_[LỚP]_[CHƯƠNG]_[MỨC ĐỘ]_[ID].png
```

Ví dụ:
- `MATH_10_CH2_MEDIUM_00123.png`
- `PHYSICS_11_CH5_HARD_00456.png`
- `CHEMISTRY_12_CH3_EASY_00789.png`

### 3.2 Cấu trúc thư mục trên Google Drive

```
- Question Images/
  - Math/
    - Grade 10/
      - Chapter 1/
      - Chapter 2/
    - Grade 11/
  - Physics/
  - Chemistry/
  - Biology/
```

### 3.3 Lưu trữ metadata trong cơ sở dữ liệu

```python
import sqlite3

def create_database():
    conn = sqlite3.connect('questions.db')
    cursor = conn.cursor()

    # Tạo bảng lưu trữ thông tin ảnh
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS question_images (
        id TEXT PRIMARY KEY,
        file_id TEXT,
        drive_link TEXT,
        subject TEXT,
        grade TEXT,
        chapter TEXT,
        level TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    conn.commit()
    conn.close()
```

## 4. Tích hợp ảnh vào website kiểm tra

### 4.1 API để truy xuất thông tin ảnh

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/question-image/<question_id>', methods=['GET'])
def get_question_image(question_id):
    conn = sqlite3.connect('questions.db')
    cursor = conn.cursor()

    cursor.execute('SELECT file_id, drive_link FROM question_images WHERE id = ?', (question_id,))
    result = cursor.fetchone()

    if result:
        return jsonify({
            'question_id': question_id,
            'file_id': result[0],
            'image_url': f"https://drive.google.com/uc?id={result[0]}"  # URL trực tiếp để hiển thị ảnh
        })
    else:
        return jsonify({'error': 'Image not found'}), 404
```

### 4.2 Component hiển thị ảnh trong frontend

```javascript
// React component
function QuestionImage({ questionId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy URL ảnh từ API
    fetch(`/api/question-image/${questionId}`)
      .then(res => res.json())
      .then(data => {
        setImageUrl(data.image_url);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi lấy ảnh:", err);
        setLoading(false);
      });
  }, [questionId]);

  if (loading) return <div>Đang tải...</div>;
  if (!imageUrl) return <div>Không tìm thấy ảnh</div>;

  return (
    <div className="question-image-container">
      <img
        src={imageUrl}
        alt={`Câu hỏi ${questionId}`}
        className="question-image"
      />
    </div>
  );
}
```

## 5. Bảo vệ ảnh khỏi tải xuống trái phép

### 5.1 Sử dụng API thay vì liên kết chia sẻ trực tiếp

Thay vì sử dụng liên kết chia sẻ Google Drive trực tiếp, hãy tạo API proxy:

```python
@app.route('/api/secure-image/<question_id>', methods=['GET'])
def get_secure_image(question_id):
    # Xác thực người dùng
    if not is_authenticated(request):
        return jsonify({'error': 'Unauthorized'}), 401

    # Lấy thông tin ảnh từ database
    conn = sqlite3.connect('questions.db')
    cursor = conn.cursor()
    cursor.execute('SELECT file_id FROM question_images WHERE id = ?', (question_id,))
    result = cursor.fetchone()

    if not result:
        return jsonify({'error': 'Image not found'}), 404

    file_id = result[0]

    # Lấy ảnh từ Google Drive
    drive_service = setup_drive_service()
    request = drive_service.files().get_media(fileId=file_id)

    # Trả về ảnh với header phù hợp
    response = make_response(request.execute())
    response.headers['Content-Type'] = 'image/png'
    response.headers['Cache-Control'] = 'private, max-age=300'

    # Thêm watermark nếu cần
    if request.args.get('watermark') == 'true':
        # Thêm watermark vào ảnh
        pass

    return response
```

### 5.2 Thêm watermark động

```python
from PIL import Image, ImageDraw, ImageFont
import io

def add_watermark(image_data, text):
    # Mở ảnh từ dữ liệu nhị phân
    image = Image.open(io.BytesIO(image_data))

    # Tạo layer cho watermark
    txt = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt)

    # Chọn font
    font = ImageFont.truetype('arial.ttf', 20)

    # Tính toán kích thước văn bản
    text_width, text_height = draw.textsize(text, font)

    # Vẽ watermark chéo trên toàn bộ ảnh
    for i in range(0, image.width, text_width + 50):
        for j in range(0, image.height, text_height + 50):
            position = (i, j)
            draw.text(position, text, font=font, fill=(128, 128, 128, 100))

    # Kết hợp ảnh gốc với watermark
    watermarked = Image.alpha_composite(image.convert('RGBA'), txt)

    # Chuyển về định dạng PNG
    output = io.BytesIO()
    watermarked.convert('RGB').save(output, format='PNG')

    return output.getvalue()
```

### 5.3 Bảo vệ ảnh trên frontend

```javascript
// CSS để ngăn chặn việc tải xuống ảnh
const protectionStyles = `
  .protected-image-container {
    position: relative;
    overflow: hidden;
  }

  .protected-image {
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .protection-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 10;
  }
`;

// Component React với bảo vệ
function ProtectedQuestionImage({ questionId, userId }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    // Lấy URL ảnh bảo mật với watermark
    fetch(`/api/secure-image/${questionId}?watermark=true&user=${userId}`)
      .then(res => {
        if (res.ok) return res.blob();
        throw new Error('Failed to load image');
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      });
  }, [questionId, userId]);

  return (
    <>
      <style>{protectionStyles}</style>
      <div className="protected-image-container">
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="Question"
              className="protected-image"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
            <div
              className="protection-overlay"
              onContextMenu={(e) => e.preventDefault()}
            />
          </>
        )}
      </div>
    </>
  );
}
```

## 6. Tối ưu hiệu suất

### 6.1 Xử lý hàng loạt và song song

```python
from concurrent.futures import ThreadPoolExecutor
import time

def batch_process_images(image_data_list, batch_size=100, max_workers=8):
    results = []

    # Chia thành các lô nhỏ
    batches = [image_data_list[i:i+batch_size] for i in range(0, len(image_data_list), batch_size)]

    for batch_index, batch in enumerate(batches):
        print(f"Xử lý lô {batch_index+1}/{len(batches)}")

        # Xử lý song song trong mỗi lô
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            batch_results = list(executor.map(process_single_image, batch))
            results.extend(batch_results)

        # Tạm dừng giữa các lô để tránh quá tải
        if batch_index < len(batches) - 1:
            print(f"Tạm dừng 5 giây trước khi xử lý lô tiếp theo...")
            time.sleep(5)

    return results
```

### 6.2 Bộ nhớ đệm cho ảnh thường xuyên sử dụng

```python
import redis
import hashlib

# Khởi tạo Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_image(question_id):
    # Tạo khóa cache
    cache_key = f"question_image:{question_id}"

    # Kiểm tra cache
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return cached_data

    # Nếu không có trong cache, lấy từ Google Drive
    image_data = fetch_image_from_drive(question_id)

    # Lưu vào cache với thời gian hết hạn 1 ngày
    redis_client.setex(cache_key, 86400, image_data)

    return image_data
```

### 6.3 Tải trước ảnh cho các câu hỏi tiếp theo

```javascript
// Frontend: Tải trước ảnh cho các câu hỏi tiếp theo
function preloadNextQuestionImages(currentQuestionIndex, questions, count = 5) {
  for (let i = 1; i <= count; i++) {
    const nextIndex = currentQuestionIndex + i;
    if (nextIndex < questions.length) {
      const nextQuestionId = questions[nextIndex].id;

      // Tạo đối tượng Image để tải trước
      const img = new Image();
      img.src = `/api/secure-image/${nextQuestionId}`;
    }
  }
}
```

## 7. Bảo trì và quản lý dài hạn

### 7.1 Kiểm tra tính toàn vẹn của ảnh định kỳ

```python
def verify_images_integrity():
    conn = sqlite3.connect('questions.db')
    cursor = conn.cursor()

    cursor.execute('SELECT id, file_id FROM question_images')
    all_images = cursor.fetchall()

    drive_service = setup_drive_service()
    issues = []

    for question_id, file_id in all_images:
        try:
            # Kiểm tra xem file còn tồn tại trên Drive không
            drive_service.files().get(fileId=file_id).execute()
        except Exception as e:
            issues.append({
                'question_id': question_id,
                'file_id': file_id,
                'error': str(e)
            })

    return issues
```

### 7.2 Sao lưu metadata định kỳ

```python
def backup_metadata():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"backups/questions_metadata_{timestamp}.json"

    conn = sqlite3.connect('questions.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM question_images')
    rows = cursor.fetchall()

    data = [dict(row) for row in rows]

    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Tải file backup lên Drive để đảm bảo an toàn
    drive_service = setup_drive_service()
    backup_folder_id = "your_backup_folder_id_here"

    file_metadata = {
        'name': os.path.basename(backup_file),
        'parents': [backup_folder_id]
    }

    media = MediaFileUpload(backup_file)
    drive_service.files().create(
        body=file_metadata,
        media_body=media
    ).execute()
```

### 7.3 Theo dõi sử dụng và phân tích

```python
def track_image_usage(question_id, user_id):
    conn = sqlite3.connect('usage_stats.db')
    cursor = conn.cursor()

    # Tạo bảng nếu chưa tồn tại
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS image_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT,
        user_id TEXT,
        view_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Ghi lại lượt xem
    cursor.execute('''
    INSERT INTO image_views (question_id, user_id)
    VALUES (?, ?)
    ''', (question_id, user_id))

    conn.commit()
    conn.close()
```

---

Quy trình này được thiết kế để xử lý hiệu quả 300.000 ảnh câu hỏi, đảm bảo hiệu suất cao và bảo mật tốt. Điều chỉnh các tham số và phương pháp dựa trên nhu cầu cụ thể của dự án.
