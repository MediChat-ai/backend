import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HOSPITAL_API_KEY = process.env.HOSPITAL_API_KEY as string;

export const getHospList = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, subjectCode } = req.query;

    if (!name) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const apiUrl = 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';

    const response = await axios.get(apiUrl, {
      params: {
        serviceKey: HOSPITAL_API_KEY,
        numOfRows: '100000',
        yadmNm: name,
        dgsbjtCd: subjectCode,
        _type: 'json',
      },
    });

    return res.json(response.data);
  } catch (error) {
    console.error('병원 목록 조회 실패:', error);
    return res.status(500).json({ error: 'Open API 요청 중 오류가 발생했습니다.' });
  }
};
