import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#0c1420',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          borderRadius: '16px',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
