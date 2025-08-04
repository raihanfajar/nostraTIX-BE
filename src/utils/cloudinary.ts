import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Konfigurasi tetap sama
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fungsi upload yang sudah dioptimalkan
export const cloudinaryUpload = async (
	file: Buffer
): Promise<UploadApiResponse> => {
	if (!file || file.length === 0) {
		throw new Error("File buffer is empty or invalid");
	}
	// Menggunakan 'data uri' agar bisa di-handle oleh uploader.upload
	const base64String = `data:image/jpeg;base64,${file.toString("base64")}`;

	try {
		const result = await cloudinary.uploader.upload(base64String, {
			folder: "evidence",
		});
		// Mengembalikan seluruh hasil dari Cloudinary, tidak hanya URL
		return result;
	} catch (error) {
		console.error("Cloudinary upload failed:", error);
		// Melempar error baru agar lebih informatif
		throw new Error("Failed to upload file to Cloudinary.");
	}
};
