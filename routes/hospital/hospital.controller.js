const axios = require('axios');
require('dotenv').config();

const HOSPITAL_API_KEY = process.env.HOSPITAL_API_KEY;

exports.getHospList = async (req, res) => {
  const { name, subjectCode, pageNo } = req.query;

  // if (!name || !subjectCode || !pageNo)
  if (!name)
    return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

  const apiUrl = "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";

  try {
    const response = await axios.get(apiUrl, {
      params: {
        serviceKey: HOSPITAL_API_KEY,
        // pageNo,
        numOfRows: "100000",
        yadmNm: name,
        dgsbjtCd: subjectCode,
        _type: "json",
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Open API 요청 중 오류가 발생했습니다." });
  }
}