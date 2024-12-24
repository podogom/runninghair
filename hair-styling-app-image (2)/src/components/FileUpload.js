import React, { useState } from "react";

const FileUpload = ({ onUpload }) => {
  const [files, setFiles] = useState({
    baseImage: null,
    hairStyleImage: null,
  });

  const [isFileSelected, setIsFileSelected] = useState({
    baseImage: false,
    hairStyleImage: false,
  });

  // 파일 변경 처리
  const handleFileChange = (event, key) => {
    const file = event.target.files[0];
    if (file) {
      setFiles((prevFiles) => {
        const newFiles = { ...prevFiles, [key]: file };
        setIsFileSelected((prevState) => ({ ...prevState, [key]: true })); // 파일 선택 상태 업데이트
        return newFiles;
      });
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, key) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFiles((prevFiles) => {
        const newFiles = { ...prevFiles, [key]: file };
        setIsFileSelected((prevState) => ({ ...prevState, [key]: true })); // 파일 선택 상태 업데이트
        return newFiles;
      });
    }
  };

  // 업로드 버튼 클릭 시 파일을 부모로 전달
  const handleUpload = () => {
    const { baseImage, hairStyleImage } = files;
      console.log("업로드된 파일들:", files);
      if (!baseImage || !hairStyleImage) {
        alert("기본 이미지와 헤어스타일 이미지를 모두 선택해주세요.");
        return;
    }

    // 부모 컴포넌트에 파일 전달
    onUpload(files);
  };

  return (
    <div className="file-upload-container">
      {/* 기본 이미지 업로드 */}
      <div
        className={`upload-box ${isFileSelected.baseImage ? "file-selected" : ""}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "baseImage")}
      >
        {!files.baseImage && (
          <label>
            기본 이미지 업로드
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "baseImage")}
              className="file-input"
            />
          </label>
        )}
        <div className="image-preview-container">
          {files.baseImage && <img src={URL.createObjectURL(files.baseImage)} alt="Base Image Preview" />}
        </div>
      </div>

      {/* 헤어스타일 이미지 업로드 */}
      <div
        className={`upload-box ${isFileSelected.hairStyleImage ? "file-selected" : ""}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "hairStyleImage")}
      >
        {!files.hairStyleImage && (
          <label>
            원하는 헤어스타일 업로드
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "hairStyleImage")}
              className="file-input"
            />
          </label>
        )}
        <div className="image-preview-container">
          {files.hairStyleImage && <img src={URL.createObjectURL(files.hairStyleImage)} alt="Hair Style Preview" />}
        </div>
      </div>

      {/* 업로드 버튼 */}
      <button onClick={handleUpload} disabled={!files.baseImage || !files.hairStyleImage}>
        업로드
      </button>
    </div>
  );
};

export default FileUpload;
