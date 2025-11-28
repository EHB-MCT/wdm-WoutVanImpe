'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css'; 

<<<<<<< Updated upstream
	const handleChange = () => {
		console.log("change");
		const file = imgInputRef.current?.files?.[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setImgPreview(objectUrl);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setImgSubmitted(true);

		const formData = new FormData();
		formData.append("image", imgInputRef.current!.files![0]);

		try {
			const response = await fetch("http://localhost:3000/OCR", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("OCR request failed");
			}

			const data = await response.json();
			setFoundText(data.text);
		} catch (error) {
			console.error(error);
			setFoundText("OCR failed");
		}
	};

	return (
		<div className={styles.ocrPage}>
			<h1 className={styles.pageTitle}>Upload your tickets here!</h1>

			<div className="card" style={{ maxWidth: "600px", width: "100%" }}>
				<form className={styles.ocrForm} onSubmit={handleSubmit}>
					<div className={styles.uploadControls}>
						<label className="label-text">Kies een afbeelding</label>

						<input ref={imgInputRef} required type="file" accept="image/*" onChange={handleChange} className="input-field" style={{ paddingTop: "10px" }} />

						<button type="submit" className="btn btn-primary">
							Upload & Scan
						</button>
					</div>

					<div className={styles.imagePreviewWrapper}>
						{imgPreview ? <Image src={imgPreview} alt="uploaded image" width={250} height={250} style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }} /> : <span style={{ color: "#9ca3af" }}>Geen afbeelding geselecteerd</span>}
					</div>
				</form>
			</div>

			{imgSubmitted && (
				<div className={styles.textResult}>
					<strong>Gevonden tekst:</strong>
					<pre style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>{foundText}</pre>
				</div>
			)}
		</div>
	);
=======
interface User {
  id: number;
  username: string;
  email: string;
>>>>>>> Stashed changes
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div className={styles.ocrPage}>Laden...</div>;
  }

  return (
    <main className={styles.ocrPage}>
      
      <h1 className={styles.pageTitle}>
        Welkom, {user ? user.username : 'Gast'}!
      </h1>

      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        
        {user ? (
          <>
            <p className="label-text" style={{ marginBottom: '20px' }}>
              Je bent ingelogd als: <br/>
              <span style={{ color: 'var(--brand-color)' }}>{user.email}</span>
            </p>
            
            <p style={{ marginBottom: '30px', color: '#6b7280' }}>
              Je hebt momenteel nog geen recent overzicht. 
              Begin met het uploaden van je eerste ticket.
            </p>

            <Link href="/upload">
              <button className="btn btn-primary" style={{ width: '100%' }}>
                Start met uploaden
              </button>
            </Link>
          </>
        ) : (
          <>
            <p className="label-text" style={{ marginBottom: '20px' }}>
              Je bent nog niet ingelogd.
            </p>
            <Link href="/login">
              <button className="btn btn-primary" style={{ width: '100%' }}>
                Naar Login
              </button>
            </Link>
          </>
        )}

      </div>
    </main>
  );
}