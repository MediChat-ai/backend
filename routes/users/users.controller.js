const crypto = require('crypto');
const Account = require('../../db/account');

exports.login = (req, res) => {
	const { user_id, pw } = req.body;
	if (!user_id || !pw)
		return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

	Account.findOne({ user_id, password: crypto.createHash('sha256').update(pw).digest('hex') })
		.then(account => {
			if (!account)
				return res.status(401).json({ error: '인증 실패: 잘못된 ID 또는 비밀번호입니다.' });
			return res.status(200).json({ message: '로그인 성공', account });
		})
		.catch(err => {
			if (!res.headersSent)
				return res.status(500).json({ error: '로그인 과정에서 오류가 발생했습니다.', details: err });
		});
}

exports.register = (req, res) => {
	const { user_id, user_name, pw } = req.body;
	if (!user_id || !user_name || !pw)
		return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

	// 중복된 user_id 확인
	Account.findOne({ user_id })
		.then(existingAccount => {
			if (existingAccount)
				return res.status(400).json({ error: '중복된 ID 입니다.' })
			return new Account({
				user_id,
				user_name,
				created_at: new Date(),
				password: crypto.createHash('sha256').update(pw).digest('hex')
			}).save();
		})
		.then(savedAccount => res.status(201).json({ message: '계정이 생성되었습니다.', account: savedAccount }))
		.catch(err => {
			if (!res.headersSent)
				return res.status(500).json({ error: '계정 생성 과정에서 오류가 발생했습니다.', details: err });
		});
}