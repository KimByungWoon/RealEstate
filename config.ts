// Vercel 환경에서는 이 파일이 자동으로 서버리스 함수로 처리됩니다.

// 이 함수는 Vercel에 저장된 네이버 클라이언트 ID를
// 프론트엔드로 안전하게 전달하는 역할을 합니다.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const naverClientId = process.env.NAVER_CLIENT_ID;

  if (!naverClientId) {
    console.error('NAVER_CLIENT_ID is not set in the server environment.');
    return res.status(500).json({ error: 'Map configuration is missing on the server.' });
  }

  return res.status(200).json({ naverClientId });
}