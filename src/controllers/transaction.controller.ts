import { Request, Response } from "express";
import {
	createTransactionService,
	createVoucherService,
	getAllCouponServiceByCode,
	getAllVoucherService,
	getWaitingConfirmationTransactionsService,
	setStatusTransactionService,
	uploadPaymentTransactionService,
} from "../services/transaction.service";
import { ICreateTransaction, IUploadPaymentProof } from "../types/transaction";

export const createTransactionController = async (
	req: Request,
	res: Response
) => {
	try {
		// Take userId from payload
		const { userId } = res.locals.payload;

		// Take data from req.boy
		const {
			eventId,
			voucherCode,
			couponCode,
			quantity,
			ticketEventCategoryId,
			point,
		} = req.body;

		// Create transaction Payload
		const transactionPayload: ICreateTransaction = {
			userId,
			eventId,
			voucherCode,
			couponCode,
			quantity,
			ticketEventCategoryId,
			point,
		};

		// 4. Call the service with the clean payload.
		const newTransaction = await createTransactionService(transactionPayload);

		// 5. Send a success response.
		res.status(201).json({
			message: "Transaction created successfully.",
			data: newTransaction,
		});
	} catch (error) {
		res
			.status(401)
			.json({ message: `Create transaction failed, Error : ${error}` });
	}
};

export const uploadPaymentTransactionController = async (
	req: Request,
	res: Response
) => {
	try {
		const file = req.file as Express.Multer.File;

		if (!file) {
			return res
				.status(400)
				.json({ message: "Payment proof file is required." });
		}

		const transactionId = req.params.slug;
		const { userId } = res.locals.payload;

		const data: IUploadPaymentProof = {
			file,
			transactionId,
			userId,
		};

		const updatedTransaction = await uploadPaymentTransactionService(data);

		return res.status(200).json({
			message: "Payment proof uploaded successfully.",
			data: updatedTransaction,
		});
	} catch (error: any) {
		return res
			.status(500)
			.json({ message: error.message || "Internal Server Error" });
	}
};

export const getAllCouponController = async (req: Request, res: Response) => {
	const code = req.query.code as string;
	const result = await getAllCouponServiceByCode(code);
	if (!result) {
		return res.status(404).json({ message: "Coupon not found" });
	}
	res.status(201).json(result);
};

export const getAllVoucherController = async (req: Request, res: Response) => {
	const code = req.query.code as string;
	const result = await getAllVoucherService(code);
	if (!result) {
		return res.status(404).json({ message: "Coupon not found" });
	}
	res.status(201).json(result);
};

export const setStatusTransactionController = async (
	req: Request,
	res: Response
) => {
	try {
		const transactionId = req.params.id;
		const { status } = req.body;

		if (!status) {
			return res.status(400).json({ message: "Status is required" });
		}

		await setStatusTransactionService({
			transactionId,
			status,
		});

		return res.status(200).json({
			message:
				status === "REJECTED"
					? "Transaction rejected and resources restored."
					: "Transaction marked as DONE and tickets generated.",
		});
	} catch (error: any) {
		return res.status(500).json({
			message: error.message || "Internal Server Error",
		});
	}
};

export const getWaitingConfirmationTransactionsController = async (
	req: Request,
	res: Response
) => {
	try {
		const { organizerId } = res.locals.payload; // dari JWT decode

		const transactions = await getWaitingConfirmationTransactionsService(
			organizerId // di tabel organizerId == userId
		);

		return res.status(200).json({
			message: "Waiting for confirmation transactions retrieved successfully",
			data: transactions,
		});
	} catch (error: any) {
		return res
			.status(500)
			.json({ message: error.message || "Internal server error" });
	}
};

export const createVoucherController = async (req: Request, res: Response) => {
	try {
		const { organizerId } = res.locals.payload;

		const { code, eventId, discount, quota, maxDiscount, expiredDate } =
			req.body;

		const voucher = await createVoucherService({
			code,
			eventId,
			discount: Number(discount),
			quota: Number(quota),
			maxDiscount: Number(maxDiscount),
			expiredDate: new Date(expiredDate),
			organizerId,
		});

		return res.status(201).json({
			message: "Voucher created successfully",
			data: voucher,
		});
	} catch (error: any) {
		return res.status(400).json({
			message: error.message || "Failed to create voucher",
		});
	}
};
