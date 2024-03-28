
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    // @ts-ignore
    imageUploader: f({ image: { maxFileSize: "5MB", maxFileCount: 1} }).onUploadComplete(async ({ metadata }) => {
        return { uploadedBy: "metadata" };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;