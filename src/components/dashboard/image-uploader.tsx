'use client';

import { useState, useRef, ChangeEvent, DragEvent, useContext, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageContext, translations } from '@/context/language-context';

interface ImageUploaderProps {
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  disabled?: boolean;
  onImageSelect?: () => void;
}

export function ImageUploader({ imagePreview, setImagePreview, disabled = false, onImageSelect }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  useEffect(() => {
    if (!imagePreview && fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [imagePreview]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // If there was an error, reset the state when a new image is selected.
        if (onImageSelect) {
          onImageSelect();
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
        handleFileChange(e.dataTransfer.files);
    }
  };
  
  const onClear = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
        fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        ref={fileInputRef}
        id="xrayImage"
        name="xrayImage"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
        required
        disabled={disabled}
      />
      {imagePreview ? (
        <div className="relative group">
          <Image
            src={imagePreview}
            alt="X-ray preview"
            width={500}
            height={500}
            className="rounded-lg object-contain w-full aspect-square border"
          />
          {!disabled && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onClear}
              type="button"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t.clearImage}</span>
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-card transition-colors',
            !disabled && 'cursor-pointer hover:bg-secondary',
            isDragging && !disabled && 'border-primary bg-secondary',
            disabled && 'cursor-not-allowed bg-muted/50'
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className={cn("w-10 h-10 mb-3", disabled ? "text-muted-foreground/50" : "text-muted-foreground")} />
            <p className={cn("mb-2 text-sm", disabled ? "text-muted-foreground/50" : "text-muted-foreground")}>
              <span className="font-semibold">{t.clickToUpload}</span> {t.orDragAndDrop}
            </p>
            <p className={cn("text-xs", disabled ? "text-muted-foreground/50" : "text-muted-foreground")}>{t.xrayImageHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}
