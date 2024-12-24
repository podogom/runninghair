import React, { useState, useEffect } from "react";

function ResultImages({ images }) {
  const [imageUrls, setImageUrls] = useState([]);
  const [isFileSelected, setIsFileSelected] = useState(false); // 이미지 선택 여부 상태 추가
  console.log("받은 이미지들:", images); // 전달된 이미지 URL 배열을 로그로 확인

  // comfyui 서버에서 생성된 이미지를 가져오는 useEffect 훅
  useEffect(() => {
    if (images.length > 0) {
      const urls = images.map((image) => image.url); // AI 서버에서 받은 이미지 URL
      setImageUrls(urls); // URL 배열을 상태로 설정
      setIsFileSelected(true); // 이미지가 선택되었으므로 테두리 색 변경
    }
  }, [images]);

  return (
    <div>
      <h2>변경된 헤어스타일</h2>
      <div className="file-upload-container">
        <div
          className={`create-image-box ${isFileSelected ? "file-selected" : ""}`} // 선택된 경우 'file-selected' 클래스 추가
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {imageUrls.map((urls, index) => (
              <img
                key={index}
                src={`http://localhost:8000${images}`} // AI 서버에서 받은 이미지 URL
                alt={`Result ${index + 1}`}
                style={{
                  width: "150px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultImages;
