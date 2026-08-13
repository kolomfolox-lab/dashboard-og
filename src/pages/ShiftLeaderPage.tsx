import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShiftLeaderPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/attendance', { replace: true }); }, []);
  return null;
}
