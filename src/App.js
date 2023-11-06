import React, { useState } from "react";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [textOCR, setTextOCR] = useState("No Result");
  const [closestMatch, setClosetMatch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const keywords = [
    "pipe",
    "socket",
    "toe",
    "Bend",
    "S.W.R",
    "PC",
    "Kunal",
    "Kumar",
    "6-4-23",
  ];

  const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
      arr[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        arr[i][j] =
          i === 0
            ? j
            : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
              );
      }
    }
    return arr[t.length][s.length];
  };

  function findClosestMatch(ocrResult, keywords) {
    const ocrWords = ocrResult.split(/\s+/); // Split the OCR result into words

    let closestMatches = [];

    for (const ocrWord of ocrWords) {
      let minDistance = Infinity;
      let closestMatch = "";

      for (const keyword of keywords) {
        const distance = levenshteinDistance(ocrWord, keyword);

        if (distance < minDistance) {
          minDistance = distance;
          closestMatch = keyword;
        }
      }

      if (minDistance === ocrWord.length) {
        closestMatch = ocrWord;
      }

      closestMatches += closestMatch + " ";
    }

    return closestMatches;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUpload = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const closestMatch = findClosestMatch(response.data.result, keywords);
      setClosetMatch(closestMatch);
      // console.log("OCR Result:", response.data.result);
      // console.log("Closest Match:", closestMatch);

      setTextOCR(response.data.result);
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <>
      <p className="mb-3 text-gray-800 dark:text-gray-400 text-center my-5">
        *Note: We have to update the keywords array for getting better result as
        keyword array is hard-coded for the assignment image only
      </p>
      <div className="flex items-center m-10 mt-0 justify-between">
        {imagePreview && (
          <div className="flex justify-center w-full mr-4">
            <img src={imagePreview} alt="" />
          </div>
        )}
        <div className="flex flex-col gap-5 items-center w-full">
          <div className="flex items-center justify-center w-full">
            <label
              for="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 bg-transparent">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400 bg-transparent"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400  bg-transparent">
                  <span className="font-semibold  bg-transparent">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400  bg-transparent">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleImageUpload}
            className="text-white w-[50%] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-lg px-5 py-2.5 text-center mr-2 mb-2 "
          >
            Get Result
          </button>

          {isLoading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>
              <h3 className="dark:text-white font-bold">
                OCR Result:
                <p className="mb-3 text-gray-800 dark:text-gray-400">
                  {textOCR}
                </p>
              </h3>
              <h3 className="dark:text-white font-bold">
                ClosestMatch :
                <p className="mb-3 text-gray-800 dark:text-gray-400">
                  {closestMatch}
                </p>
              </h3>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
