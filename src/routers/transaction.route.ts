import express from "express";
import {
	createTransactionController,
	createVoucherController,
	getAllCouponController,
	getAllVoucherController,
	getAllVoucherControllerLiterally,
	getUserTicketsController,
	getWaitingConfirmationTransactionsController,
	setStatusTransactionController,
	uploadPaymentTransactionController,
} from "../controllers/transaction.controller";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";
import { uploaderMulter } from "../middlewares/Uploader.Multer";

const transactionRouter = express.Router();
const uploader = uploaderMulter(
	["image"], // Menerima tipe file gambar (jpeg, png, gif, dll.)
	"memory" // Simpan file di memori sebagai buffer
);

transactionRouter.get("/coupon/check", getAllCouponController);
transactionRouter.get("/voucher/check", getAllVoucherController);
transactionRouter.post("/create", verifyToken, createTransactionController);
transactionRouter.post(
	"/payment/:slug",
	verifyToken,
	uploader.single("paymentProof"),
	uploadPaymentTransactionController
);
transactionRouter.patch(
	"/status/:id",
	verifyToken,
	verifyRole("ORGANIZER"),
	setStatusTransactionController
);
transactionRouter.get(
	"/waiting-confirmation",
	verifyToken,
	verifyRole("ORGANIZER"),
	getWaitingConfirmationTransactionsController
);
transactionRouter.post(
	"/create/voucher",
	verifyToken,
	verifyRole("ORGANIZER"),
	createVoucherController
);
transactionRouter.get("/voucher", getAllVoucherControllerLiterally);
transactionRouter.get("/ticket", getUserTicketsController);

export default transactionRouter;
