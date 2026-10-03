import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUpload } from '@/lib/upload-hooks';

export default function Capture() {
  const router = useRouter();
  const [status, setStatus] = useState('Initialisation...');
  const { start, upload } = useUpload();

  useEffect(() => {
    if (upload?.status === 'done') {
      setStatus('✅ Capture sauvegardée !');
      const timer = setTimeout(() => router.push('/gallery'), 1200);
      return () => clearTimeout(timer);
    }

    if (upload?.status === 'error') {
      setStatus('❌ Erreur : ' + (upload.error?.message || 'Échec de l’envoi'));
    }

    if (upload?.pending) {
      setStatus(`📤 Envoi en cours... ${upload.percent}%`);
    }
  }, [upload, router]);

  useEffect(() => {
    if (!router.isReady) return;

    const { token } = router.query;
    if (!token) {
      setStatus('❌ Token manquant');
      return;
    }

    const run = async () => {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error('Le partage/capture d’écran n’est pas pris en charge par ce navigateur.');
        }

        setStatus('🔓 Demande d’accès à l’écran...');

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        await video.play();
        await new Promise((resolve) => setTimeout(resolve, 400));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Impossible de préparer la capture.');

        context.drawImage(video, 0, 0);
        stream.getTracks().forEach((track) => track.stop());

        setStatus('📤 Préparation de l’envoi...');

        canvas.toBlob((blob) => {
          if (!blob) {
            setStatus('❌ Erreur de capture');
            return;
          }

          const file = new File([blob], 'capture.png', { type: 'image/png' });
          start({ file });
        }, 'image/png');
      } catch (error) {
        setStatus('❌ ' + (error instanceof Error ? error.message : 'Capture annulée ou impossible'));
      }
    };

    run();
  }, [router.isReady, router.query.token, start]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Message-App</h1>
      <div style={styles.status}>{status}</div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui',
    background: '#0f172a',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: 0,
    textAlign: 'center',
    padding: 20,
  },
  title: { fontSize: 22, color: '#25D366' },
  status: { fontSize: 16, marginTop: 20, padding: 20 },
};
