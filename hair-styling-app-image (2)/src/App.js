import './App.css';
import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import ResultImages from "./components/ResultImages";

function App() {
  const [uploadedFiles, setUploadedFiles] = useState({
    baseImage: null,
    hairStyleImage: null,
  });
  const [results, setResults] = useState([]);
  const [imageIds, setImageIds] = useState({}); // 초기값을 객체로 수정

  // 파일이 업로드되면 파일 상태를 설정
  const handleFileUpload = (files) => {
    setUploadedFiles(files); // 부모 컴포넌트로 파일 전달
  };

  // 이미지 업로드 및 변환 요청 함수
  const handleUploadAndTransform = async () => {
    const { baseImage, hairStyleImage } = uploadedFiles;
  
    if (!baseImage || !hairStyleImage) {
      alert("두 이미지를 모두 업로드해주세요.");
      return;
    }
  
    const formData = new FormData();
    formData.append("image1", baseImage); // FastAPI의 image1에 맞춤
    formData.append("image2", hairStyleImage); // FastAPI의 image2에 맞춤
  
    try {
      // 이미지 업로드 요청
      const response = await fetch("http://localhost:8000/uploads/", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const result = await response.json(); // 성공적인 응답에서만 JSON 파싱
        console.log("이미지 업로드 성공:", result);
        setImageIds(result.image_ids); // 업로드된 이미지 ID 저장
        // 헤어스타일 변환 요청
        handleHairStyleChange(result.image_ids);
      } else {
        const errorText = await response.text(); // 실패 시 텍스트로 읽기
        console.error("Error response:", errorText);
        alert(`이미지 업로드 실패: ${errorText}`); // 에러 메시지 출력
      }
    } catch (error) {
      console.error("서버 연결 실패:", error);
      alert("이미지 업로드 실패. 다시 시도해주세요.");
    }
  };

  // 헤어스타일 변환 요청 함수
  const handleHairStyleChange = async (imageIds) => {
    if (!imageIds || Object.keys(imageIds).length < 2) {
      alert("두 개의 이미지 ID가 필요합니다.");
      return;
    }

    try {
      // URL에 이미지 ID를 포함하여 요청
      const response = await fetch(`http://localhost:8000/result/${imageIds.image1_id}/${imageIds.image2_id}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setResults([data.result_url]); // AI 서버에서 받은 결과 URL
      } else {
        const errorText = await response.text(); // 실패 시 텍스트로 읽기
        console.error("Error response:", errorText);
        alert("헤어스타일 변환 실패. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("헤어스타일 변환 요청 실패:", error);
      alert("헤어스타일 변환 실패. 다시 시도해주세요.");
    }
  };

  // 업로드된 이미지가 없으면 버튼 비활성화
  const isButtonDisabled =
    !uploadedFiles.baseImage || !uploadedFiles.hairStyleImage;

  return (
    <div className="App">
      <h1>AI 헤어스타일 변환기</h1>

      {/* FileUpload 컴포넌트에서 파일을 업로드한 후 부모 컴포넌트로 전달 */}
      <FileUpload onUpload={handleFileUpload} />

      {/* 업로드된 이미지로 스타일 변환 요청 */}
      <button onClick={handleUploadAndTransform} disabled={isButtonDisabled}>
        업로드 & 변환 요청
      </button>

      {/* AI 서버에서 반환한 결과 이미지를 표시 */}
      <ResultImages images={results} />
    </div>
  );
}

export default App;
