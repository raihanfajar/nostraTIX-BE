import {
	ICreateTransaction,
	ISetStatusTransaction,
	IUploadPaymentProof,
	IVoucherCreate,
} from "../types/transaction";
import prisma from "../config";
import { ApiError } from "../utils/ApiError";
import { addDays, addHours } from "date-fns";
import { cloudinaryUpload } from "../utils/cloudinary";
import { Status } from "../generated/prisma";

export const createTransactionService = async (data: ICreateTransaction) => {
	const {
		userId,
		eventId,
		voucherCode,
		couponCode,
		quantity,
		ticketEventCategoryId,
		point,
	} = data;

	return prisma.$transaction(async (tx) => {
		let initialTotalPrice: number;
		let finalPrice: number;

		try {
			const ticketCategory = await tx.ticketEventCategory.update({
				where: { id: ticketEventCategoryId, seatQuota: { gte: quantity } },
				data: { seatQuota: { decrement: quantity } },
			});
			initialTotalPrice = ticketCategory.price * quantity;
			finalPrice = initialTotalPrice;
		} catch (error) {
			throw new ApiError(
				404,
				"Tickets are sold out or insufficient quantity available."
			);
		}

		// Count total price if user use voucher
		if (voucherCode) {
			try {
				const voucher = await tx.voucher.update({
					where: {
						code: voucherCode,
						expiredDate: { gte: new Date() },
						quota: { gt: 0 },
					},
					data: {
						quota: {
							decrement: 1,
						},
					},
				});
				let totalVoucherDiscount = (voucher.discount / 100) * initialTotalPrice;
				if (totalVoucherDiscount >= voucher.maxDiscount) {
					totalVoucherDiscount = voucher.maxDiscount;
				}
				finalPrice -= totalVoucherDiscount;
			} catch (error) {
				throw new ApiError(400, "Error applying voucher: " + error);
			}
		}

		// Count total price if user use coupon
		if (couponCode) {
			try {
				const coupon = await tx.coupon.update({
					where: {
						code: couponCode,
						expiredDate: { gte: new Date() },
						quota: { gt: 0 },
					},
					data: {
						quota: {
							decrement: 1,
						},
					},
				});
				let totalCouponDiscount = (coupon.discount / 100) * initialTotalPrice;
				if (totalCouponDiscount >= coupon.maxDiscount) {
					totalCouponDiscount = coupon.maxDiscount;
				}
				finalPrice -= totalCouponDiscount;
			} catch (error) {
				throw new ApiError(400, "Error applying coupon: " + error);
			}
		}

		// Count total price if user use point
		if (point) {
			try {
				await tx.user.update({
					where: { id: userId, balancePoint: { gte: point } },
					data: {
						balancePoint: {
							decrement: point,
						},
					},
				});
				finalPrice -= point;
			} catch (error) {
				throw new ApiError(400, "Error applying point deduction: " + error);
			}
		}

		// Ensure final price is not negative
		if (finalPrice < 0) {
			finalPrice = 0;
		}

		// Create Transaction record
		return await tx.transaction.create({
			data: {
				userId,
				eventId,
				voucherCode,
				couponCode,
				quantity,
				point: point || 0,
				totalPrice: finalPrice,
				ticketEventCategoryId,
				expiryAt: addHours(new Date(), 2), // Set expiry to 2 hours from now
			},
		});
	});
};

export const uploadPaymentTransactionService = async (
	data: IUploadPaymentProof
) => {
	const { transactionId, file, userId } = data;
	return prisma.$transaction(async (tx) => {
		const transaction = await tx.transaction.findFirst({
			where: { id: transactionId, userId: userId },
		});

		if (!transaction || transaction.status !== "WAITING_PAYMENT") {
			throw new Error("Transaction not found or cannot be updated.");
		}

		const uploadResult = await cloudinaryUpload(file.buffer);

		if (!uploadResult || !uploadResult.secure_url) {
			throw new Error("File upload to Cloudinary failed.");
		}

		const updatedTransaction = await tx.transaction.update({
			where: {
				id: transactionId,
			},
			data: {
				status: "WAITING_FOR_CONFIRMATION",
				paymentProof: uploadResult.secure_url, // Save the URL from Cloudinary
				expiryAt: addDays(new Date(), 3),
			},
		});

		return updatedTransaction;
	});
};

export const getAllCouponServiceByCode = async (code: string) => {
	const result = prisma.coupon.findFirst({
		where: { code: code, quota: { gt: 0 }, expiredDate: { gte: new Date() } },
	});
	if (!result) throw new ApiError(404, "Coupon not found");
	return result;
};

export const getAllVoucherService = async (code: string) => {
	const result = prisma.voucher.findFirst({
		where: { code: code, quota: { gt: 0 }, expiredDate: { gte: new Date() } },
	});

	if (!result) throw new ApiError(404, "Coupon not found");
	return result;
};

export const getAllVoucherServiceLiterally = async (eventId: string) => {
	const result = prisma.voucher.findMany({
		where: { eventId: eventId} ,
	});

	if (!result) throw new ApiError(404, "Coupon not found");
	return result;
};

export const setStatusTransactionService = async (
	data: ISetStatusTransaction
) => {
	const { status, transactionId } = data;

	console.log(">>>>>");

	try {
		if (status === "REJECTED") {
			await prisma.$transaction(async (tx) => {
				const rejectedTransaction = await tx.transaction.findUnique({
					where: { id: transactionId },
				});

				if (!rejectedTransaction) {
					throw new Error("Transaction not found.");
				}

				// Restore seat quota
				await tx.ticketEventCategory.update({
					where: { id: rejectedTransaction.ticketEventCategoryId },
					data: { seatQuota: { increment: rejectedTransaction.quantity } },
				});

				// Restore voucher quota
				if (rejectedTransaction.voucherCode) {
					await tx.voucher.update({
						where: { code: rejectedTransaction.voucherCode },
						data: { quota: { increment: 1 } },
					});
				}

				// Restore coupon quota
				if (rejectedTransaction.couponCode) {
					await tx.coupon.update({
						where: { code: rejectedTransaction.couponCode },
						data: { quota: { increment: 1 } },
					});
				}

				// Restore user points
				if (rejectedTransaction.point && rejectedTransaction.point > 0) {
					await tx.user.update({
						where: { id: rejectedTransaction.userId },
						data: { balancePoint: { increment: rejectedTransaction.point } },
					});
				}

				// Update status jadi REJECTED
				await tx.transaction.update({
					where: { id: transactionId },
					data: { status: "REJECTED" },
				});
			});
		} else {
			await prisma.$transaction(async (tx) => {
				// Ambil detail transaksi + relasi event & kategori tiket
				const transaction = await tx.transaction.findUnique({
					where: { id: transactionId },
					include: {
						event: true,
						TicketEventCategory: true,
					},
				});

				if (!transaction) {
					throw new Error("Transaction not found.");
				}

				// Update status jadi DONE
				await tx.transaction.update({
					where: { id: transactionId },
					data: { status: "DONE" },
				});

				// Generate tiket sesuai quantity
				const ticketsData = Array.from({ length: transaction.quantity }).map(
					() => ({
						eventId: transaction.eventId,
						transactionId: transaction.id,
						eventCategoryId: transaction.ticketEventCategoryId,
						eventName: transaction.event.name,
						nameCategory: transaction.TicketEventCategory.name,
						eventDate: transaction.event.startDate, // pakai startDate dari Event
						qrCode:
							"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/368px-QR_Code_Example.svg.png",
					})
				);

				await tx.ticket.createMany({
					data: ticketsData,
				});
			});
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getWaitingConfirmationTransactionsService = async (
	organizerId: string
) => {
	return prisma.transaction.findMany({
		where: {
			status: Status.WAITING_FOR_CONFIRMATION,
			event: {
				organizerId: organizerId,
			},
		},
		include: {
			event: {
				select: {
					id: true,
					name: true,
					startDate: true,
					endDate: true,
				},
			},
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			TicketEventCategory: {
				select: {
					name: true,
					price: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
};

export const createVoucherService = async (data: IVoucherCreate) => {
  const { code, eventId, discount, quota, maxDiscount, expiredDate, organizerId } = data;

  // Pastikan eventId memang milik organizer ini
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId: organizerId
    }
  });

  if (!event) {
    throw new Error("Event not found or not owned by you.");
  }

  // Cek apakah voucher code sudah ada
  const existingVoucher = await prisma.voucher.findUnique({
    where: { code }
  });

  if (existingVoucher) {
    throw new Error("Voucher code already exists.");
  }

  // Simpan voucher
  const voucher = await prisma.voucher.create({
    data: {
      code,
      eventId,
      discount,
      quota,
      maxDiscount,
      expiredDate
    }
  });

  return voucher;
};

export const getUserTicketsService = async (userId: string) => {
  return prisma.ticket.findMany({
    where: {
      transaction: {
        userId,
      },
    },
    include: {
      event: true,
      category: true,
      transaction: {
        select: {
          status: true,
          quantity: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};