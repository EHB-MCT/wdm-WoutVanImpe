'use client';
import Image from "next/image";
import { Button } from "../ui/Button";
import styles from "@/styles/pages/Upload.module.css";

interface ImageUploadProps {
  imgInputRef: React.RefObject<HTMLInputElement | null>;
  imgPreview: string;
  onChange: () => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ImageUpload({ imgInputRef, imgPreview, onChange, isLoading, onSubmit }: Readonly<ImageUploadProps>) {
  return (
    <div className={`card ${styles.uploadCard}`}>
      <form className={styles.ocrForm} onSubmit={onSubmit}>
        <div className={styles.uploadControls}>
          <label htmlFor="image-upload" className="label-text">Kies een afbeelding</label>

          <input 
            id="image-upload"
            ref={imgInputRef} 
            required 
            type="file" 
            accept="image/*" 
            onChange={onChange} 
            className={`input-field ${styles.fileInput}`}
            disabled={isLoading} 
          />
        </div>

        <div className={styles.uploadButtonContainer}>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isLoading || !imgPreview} 
            className={`${isLoading ? styles.loadingButton : styles.normalButton}`}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isLoading && imgPreview) {
                onSubmit(e);
              }
            }}
          >
            {isLoading ? "Processing..." : "Upload & Scan"}
          </Button>
        </div>

        <div className={styles.imagePreviewWrapper}>
          {imgPreview ? (
             <Image 
              src={imgPreview} 
              alt="Afbeelding van geselecteerd bon" 
              width={250} 
              height={250} 
              className={styles.previewImage}
            />
          ) : (
            <span className={styles.noImageText}>Geen afbeelding geselecteerd</span>
          )}
        </div>
      </form>
    </div>
  );
}