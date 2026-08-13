import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuditorPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/analytics', { replace: true }); }, []);
  return null;
}
