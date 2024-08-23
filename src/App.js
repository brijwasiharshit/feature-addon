import React, { useState } from 'react';
import mammoth from 'mammoth';
import { Box, Typography, Button, Input, Avatar } from "@mui/material";

const Upload = () => {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileName(file.name);
        setError("");
        setFile(file);
      } else {
        setFileName("");
        setError("Only .doc and .docx files are allowed.");
        setFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFileName(file.name);
        setError("");
        setFile(file);
      } else {
        setFileName("");
        setError("Only .doc and .docx files are allowed.");
        setFile(null);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      // console.log(result.value);
      const parsedData = parseQuestions(result.value);
      setParsedQuestions(parsedData);
    } catch (error) {
      console.error('Error extracting text from file:', error);
    }
  };

  const getAnswerData = (type, block) => {
    // console.log(block);
    // Assume block contains the text data
    const text = block; // Assign the text from the block
  
    let answerData = {
      singleChoice: [
        {
            option: "option value",
            points: 0,
            negative_points: 0,
            isCorrect: "true/false",
            isChecked: false
        }
    ],
    multipleChoice: [
        {
            option: "option value",
            points: 0,
            negative_points: 0,
            isCorrect: "true/false",
            isChecked: false,
        }
    ],
    trueFalse: [
        { option: "True", isCorrect: "true/false", isChecked: false },
        { option: "False", isCorrect: "true/false", isChecked: false },
    ],
    sortingChoice: [
        {
          option: "",
          position: 0,
        }
    ],
    matrixSortingChoice: [
        {
            criteria: "",
            position: 0,
            element: "",
          }
    ],
    fillInTheBlank: {
        option: "",
        caseSensitive: false,
        correctOption: [],
    },
    numerical: {
        option: "option value",
        yourAnswer: "",
    },
    rangeType: {
        from: "",
        to: "",
        yourAnswer: "",
    },
    paragraph: {}
    };
  
    switch (type) {
      case "singleChoice":
      case "multipleChoice":
        const optionPattern = /([ABCD]):\) (.*?)<\/p>/g; // Matches the options
        const correctPattern = /:Correct: ([ABCD](?:, [ABCD])*)<\/p>/g; // Captures one or more correct option letters
  
        const options = [...text.matchAll(optionPattern)].map(match => ({
          letter: match[1],
          text: match[2]
        }));
  
        const correctMatches = [...text.matchAll(correctPattern)];
        const correct = correctMatches.flatMap(match => match[1].split(', ').map(option => option.trim()));
  
        
        answerData[type] =   options.map(opt => ({
          option: opt.text,
          points: correct.includes(opt.letter) ? 1 : 0,
          negative_points: 0,
          isCorrect: correct.includes(opt.letter) ? 'true' : 'false',
          isChecked: false
        }));
        
  
        break;
  
      case "trueFalse":
        const trueFalsePattern = /([ABCD]):\) (.*?)<\/p>/g; 
        const trueFalseCorrectPattern = /:Correct: ([ABCD](?:, [ABCD])*)<\/p>/g; 
  
        const trueFalseOptions = [...text.matchAll(trueFalsePattern)].map(match => ({
          letter: match[1],
          text: match[2]
        }));
  
        const trueFalseCorrectMatches = [...text.matchAll(trueFalseCorrectPattern)];
        const trueFalseCorrect = trueFalseCorrectMatches.flatMap(match => match[1].split(', ').map(option => option.trim()));
  
        
        answerData[type] = trueFalseOptions.map(opt => ({
          option: opt.letter === 'A' ? "True" : "False",
          isCorrect: trueFalseCorrect.includes(opt.letter),
          isChecked: false
        }));
  
        break;
  
      case "sortingChoice":
        const sortingChoicePattern = /([ABCD]):\) (.*?)<\/p>/g; 
        const sortingChoiceCorrectPattern = /:Correct: ([ABCD](?:, [ABCD])*)<\/p>/g; 
  
        const sortingOptions = [...text.matchAll(sortingChoicePattern)].map(match => ({
          letter: match[1],
          text: match[2]
        }));
  
        const sortingCorrectMatches = [...text.matchAll(sortingChoiceCorrectPattern)];
        const sortingCorrect = sortingCorrectMatches.flatMap(match => match[1].split(', ').map(option => option.trim()));
  
        answerData[type] = sortingOptions.map((opt, ind) => ({
          option: opt.text,
          position: ind + 1
        }));
  
        break;
  
      case "matrixSortingChoice":
        answerData = [
          {
            criteria: "",
            position: 0,
            element: ""
          }
        ];
        break;
  
      case "fillInTheBlank":
        answerData = {
          option: "",
          caseSensitive: false,
          correctOption: []
        };
        break;
  
      case "numerical":
        const ansPattern = /:Answer:\s*(.*?)<\/p>/; 
  
        const match = text.match(ansPattern);
        const ans = match ? match[1].trim() : ""; 
  
        answerData = {
          option: ans,   
          yourAnswer: ""    
        };
        break;
  
      case "rangeType":
        const fromExp = /:From:\s*(.*?)<\/p>/;
        const toExp = /:To:\s*(.*?)<\/p>/;
  
        const fromMatch = text.match(fromExp);
        const toMatch = text.match(toExp);
  
        const fromValue = fromMatch ? fromMatch[1].trim() : null;
        const toValue = toMatch ? toMatch[1].trim() : null;
  
        answerData = {
          from: fromValue,
          to: toValue,
          yourAnswer: ""
        };
        break;
  
      case "paragraph":
        answerData = {};
        break;
  
      default:
        answerData = []; 
        break;
    }
  
    return answerData;
  };

  
  
  

  

  const parseQuestions = (text) => {
    const splitted_arr = text.split(/<p>:Type/g);
    splitted_arr.map((block,idx) => {
      if(idx > 0){
         const obj =  {
          different_incorrect_msg: "true/false",
          answer_type: "singleChoice/multipleChoice/trueFalse/sortingChoice/fillInTheBlank/numerical/rangeType",
          language: [
              {
                  language_id: 1,
                  default: true,
                  question: "Question data...",
                  correct_msg: "Correct msg...",
                  incorrect_msg: "Incorrect msg...",
                  hint_msg: "Hint msg...",
                  answer_data: {
                    singleChoice: [
                        {
                            option: "option value",
                            points: 0,
                            negative_points: 0,
                            isCorrect: "true/false",
                            isChecked: false
                        }
                    ],
                    multipleChoice: [
                        {
                            option: "option value",
                            points: 0,
                            negative_points: 0,
                            isCorrect: "true/false",
                            isChecked: false,
                        }
                    ],
                    trueFalse: [
                        { option: "True", isCorrect: "true/false", isChecked: false },
                        { option: "False", isCorrect: "true/false", isChecked: false },
                    ],
                    sortingChoice: [
                        {
                          option: "",
                          position: 0,
                        }
                    ],
                    matrixSortingChoice: [
                        {
                            criteria: "",
                            position: 0,
                            element: "",
                          }
                    ],
                    fillInTheBlank: {
                        option: "",
                        caseSensitive: false,
                        correctOption: [],
                    },
                    numerical: {
                        option: "option value",
                        yourAnswer: "",
                    },
                    rangeType: {
                        from: "",
                        to: "",
                        yourAnswer: "",
                    },
                    paragraph: {}
                }
                 
              }
          ]
      }
      
        const regex_for_sameExp = /SameExp: [TF]/g;
        const regex_for_ansType = /^: [SMFNRT][cb]?/g;
        const diff_inc_msg = block.match(regex_for_sameExp)[0][9];
        const ans_type_keyword_pr = block.match(regex_for_ansType)[0][2]; //primary letter of type
        const ans_type_keyword_sc = block.match(regex_for_ansType)[0][3]; //secondary letter of type
        
      //setting answer_type acc to the keyword
      if(ans_type_keyword_pr == 'S' && ans_type_keyword_sc == null) obj.answer_type = "singleChoice";
      else if(ans_type_keyword_pr == 'M') obj.answer_type = "multipleChoice";
      else if(ans_type_keyword_pr == "S" && ans_type_keyword_sc == "c") obj.answer_type = "sortingChoice";
      else if(ans_type_keyword_pr == "T") obj.answer_type = "trueFalse";
      else if(ans_type_keyword_pr == "F" && ans_type_keyword_sc) obj.answer_type = "fillInTheBlank";
      else if(ans_type_keyword_pr == "N") obj.answer_type = "numerical";
      else if(ans_type_keyword_pr == "R") obj.answer_type = "rangeType";
      

      //setting diff_incorrect_msg
        if(diff_inc_msg == 'T') obj.different_incorrect_msg = "true";
        else obj.different_incorrect_msg = "false";


        const questionPattern = /Q:\)\s*([\s\S]*?)(?=(?:Q:\)|$))/g;

        // Extract questions and their details
        const language = [];
        let match;
        let language_id = 0;
        let correct = 0;
        while ((match = questionPattern.exec(block)) !== null) {
          language_id++;
          const block = match[1].trim();
          // Extract metadata from the question block
          const questionTextMatch = /^(.*?)(?=\s*:Answer:|\s*:ExpCorrect:|\s*:ExpIncorrect:|\s*:hint:|$)/s.exec(block);
          const answerMatch = /:Answer:\s*(.*?)(?=\s*:ExpCorrect:|\s*:ExpIncorrect:|\s*:hint:|$)/s.exec(block);
          const expCorrectMsgMatch = /:ExpCorrect:\s*(.*?)(?=\s*:ExpIncorrect:|\s*:hint:|$)/s.exec(block);
          const expIncorrectMsgMatch = /:ExpIncorrect:\s*(.*?)(?=\s*:hint:|$)/s.exec(block);
          const hintMsgMatch = /:hint:\s*(.*)/s.exec(block);
        
          const questionText = questionTextMatch ? questionTextMatch[1].trim() : '';
          const answer = answerMatch ? answerMatch[1].trim() : '';
          const expCorrectMsg = expCorrectMsgMatch ? expCorrectMsgMatch[1].trim() : '';
          const expIncorrectMsg = expIncorrectMsgMatch ? expIncorrectMsgMatch[1].trim() : '';
          const hintMsg = hintMsgMatch ? hintMsgMatch[1].trim() : '';
        
          language.push({
            id: null,
            language_id: language_id,
            default: false,          
            question: questionText,
            answer: answer,
            correct_msg: expCorrectMsg,
            incorrect_msg: expIncorrectMsg,
            hint_msg: hintMsg,
            answer_data:  getAnswerData(obj.answer_type,block)
    
          });
        }
        obj.language = language;
        console.log(obj);
        
      }

    }
    )
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100vh",
        bgcolor: "background.paper",
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        component="div"
        gutterBottom
        sx={{ marginTop: 4 }}
      >
        Upload Your Documents
      </Typography>
      <Typography variant="body1" gutterBottom>
        Upload the document file containing questions as per the given format
      </Typography>
      <Box
        sx={{
          width: "70%",
          height: "60%",
          border: "2px dotted blue",
          padding: "30px 5px",
          backgroundColor: "#eaebff",
          margin: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Avatar
          src="https://canto-wp-media.s3.amazonaws.com/app/uploads/2019/09/19193806/file-upload-site-3.jpg"
          sx={{ height: "200px", width: "200px" }}
        />
        <Input
          accept=".doc,.docx"
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" color="primary" component="span">
            Select File
          </Button>
        </label>
        {!fileName && (
          <Typography sx={{ margin: "10px 0px 10px 0px" }}>
            Please select a file to be uploaded
          </Typography>
        )}
        {fileName && (
          <>
            <Typography variant="body2" sx={{ marginTop: 2 }}>
              Selected file: {fileName}
            </Typography>
            {!error && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                sx={{ marginTop: 2 }}
              >
                Submit
              </Button>
            )}
          </>
        )}
        {error && (
          <Typography variant="body2" sx={{ color: "red", marginTop: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
      <Box sx={{ width: '100%', overflow: 'auto', maxHeight: '40vh' }}>
        <pre>{JSON.stringify(parsedQuestions, null, 2)}</pre>
      </Box>
    </Box>
  );
};

export default Upload;
