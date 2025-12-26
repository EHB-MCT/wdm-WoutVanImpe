'use client';
import Image from "next/image";
import { Button } from "../ui/Button";
import styles from "../../styles/pages/Upload.module.css";

interface ImageUploadProps {
  imgInputRef: React.RefObject<HTMLInputElement | null>;
  imgPreview: string;
  onChange: () => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ImageUpload({ imgInputRef, imgPreview, onChange, isLoading, onSubmit }: ImageUploadProps) {
  return (
    <div className="card" style={{ maxWidth: "600px", width: "100%" }}>
      <form className={styles.ocrForm} onSubmit={onSubmit}>
        <div className={styles.uploadControls}>
          <label className="label-text">Kies een afbeelding</label>

          <input 
            ref={imgInputRef} 
            required 
            type="file" 
            accept="image/*" 
            onChange={onChange} 
            className="input-field" 
            style={{ paddingTop: "10px" }} 
            disabled={isLoading} 
          />
        </div>

        <div className={componentStyles.uploadButtonContainer}>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isLoading || !imgPreview} 
            style={isLoading ? { backgroundColor: "var(--disabled-bg)", cursor: "default" } : { width: "100%" }}
          >
            {isLoading ? "Processing..." : "Upload & Scan"}
          </Button>
        </div>

        <div className={styles.imagePreviewWrapper}>
          {imgPreview ? (
            <Image 
              src={imgPreview} 
              alt="uploaded image" 
              width={250} 
              height={250} 
              style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }} 
            />
          ) : (
            <span style={{ color: "var(--placeholder-color)" }}>Geen afbeelding geselecteerd</span>
          )}
        </div>
      </form>
    </div>
  );
}