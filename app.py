import os
import sys
from flask import Flask, request, render_template, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename

import importlib.util
import uuid

# 파일 경로 지정
module_name = "workflow_api"
module_path = os.path.join("custom_nodes", "ComfyUI-to-Python-Extension", "workflow_api.py")

# 동적으로 모듈 로드
spec = importlib.util.spec_from_file_location(module_name, module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# Flask 애플리케이션 생성
app = Flask(__name__)

# 업로드 및 출력 파일이 저장될 폴더
UPLOAD_FOLDER = './input'
OUTPUT_FOLDER = './output'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# 허용할 파일 확장자 (이미지 파일 형식)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# 파일 확장자 확인 함수
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 메인 업로드 및 처리 루트
@app.route('/', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        if 'image1' not in request.files or 'image2' not in request.files:
            return redirect(request.url)
        
        image1 = request.files['image1']
        image2 = request.files['image2']
        
        if image1 and allowed_file(image1.filename):
            ext1 = os.path.splitext(image1.filename)[1]
            uid_img1 = f"{uuid.uuid4()}{ext1}"
            img1_path = os.path.join(app.config['UPLOAD_FOLDER'], uid_img1)
            image1.save(img1_path)
        
        if image2 and allowed_file(image2.filename):
            ext2 = os.path.splitext(image2.filename)[1]
            uid_img2 = f"{uuid.uuid4()}{ext2}"
            img2_path = os.path.join(app.config['UPLOAD_FOLDER'], uid_img2)
            image2.save(img2_path)
        
        result_img_uid = uuid.uuid4()
        module.main(uid_img1, uid_img2, result_img_uid)
        
        return redirect(url_for('result', img1=uid_img1, img2=uid_img2, result_img=f"{result_img_uid}_00001_.png"))

    return '''
    <!doctype html>
    <title>이미지 업로드</title>
    <h1>이미지 2개를 업로드하세요</h1>
    <form method="post" enctype="multipart/form-data">
      <label for="image1">이미지 1</label>
      <input type="file" name="image1"><br><br>
      <label for="image2">이미지 2</label>
      <input type="file" name="image2"><br><br>
      <input type="submit" value="업로드">
    </form>
    '''

# 결과 표시 페이지
@app.route('/result')
def result():
    # 결과 이미지 파일 찾기
    img1 = request.args.get("img1", None)
    img2 = request.args.get("img2", None)
    result_img = request.args.get("result_img", None)
    
    if img1 is None or img2 is None:
        return "입력 이미지가 없습니다."
    
    if result_img is None:
        return "Error: 결과 파일이 없습니다."

    # HTML로 업로드 및 결과 이미지 표시
    return f'''
    <!doctype html>
    <title>결과 이미지</title>
    <h1>처리 결과</h1>
    <h3>업로드된 이미지 1:</h3>
    <img src="/uploaded_images/{img1}" style="max-width: 300px;">
    <h3>업로드된 이미지 2:</h3>
    <img src="/uploaded_images/{img2}" style="max-width: 300px;">
    <h3>결과 이미지:</h3>
    <img src="/output_images/{result_img}" style="max-width: 400px;">
    <br><br>
    <a href="/">다시 업로드</a>
    '''

# 업로드된 이미지 정적 파일 제공
@app.route('/uploaded_images/<filename>')
def uploaded_images(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 결과 이미지 정적 파일 제공
@app.route('/output_images/<filename>')
def output_images(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

# 애플리케이션 실행
if __name__ == '__main__':
    # 필요한 디렉터리 생성
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    app.run(debug=True)
