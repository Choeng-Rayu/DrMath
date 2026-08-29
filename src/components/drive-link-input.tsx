"use client";

import { DriveImageUploader } from "@/components/drive-image-uploader";

export function DriveLinkInput({ id, name, defaultValue }: { id: string; name: string; defaultValue?: string }) {
  return (
    <DriveImageUploader
      id={id}
      name={name}
      defaultValue={defaultValue}
    />
  );
}

