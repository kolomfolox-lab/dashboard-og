import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DispatcherPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/dashboard', { replace: true }); }, []);
  return null;
}
