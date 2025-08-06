import prisma from "../../config";

// Renamed for clarity
export const expireTransactionsJob = async () => {
  // 1. Find all transactions that have expired
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: "WAITING_PAYMENT",
      expiryAt: {
        lt: new Date(), // Less than the current time
      },
    },
  });

  // If there's nothing to process, exit early
  if (expiredTransactions.length === 0) {
    console.log("[⌚ CRON] No transactions to expire.");
    return;
  }

  try {
    // 2. Use a transaction to ensure all updates succeed or none do
    await prisma.$transaction(async (tx) => {
      // 3. Loop through each expired transaction to restore resources
      for (const trx of expiredTransactions) {
        
        // Restore the seat quota for the ticket category
        await tx.ticketEventCategory.update({
          where: { id: trx.ticketEventCategoryId },
          data: { seatQuota: { increment: trx.quantity } },
        });

        // If a voucher was used, restore its quota
        if (trx.voucherCode) {
          await tx.voucher.update({
            where: { code: trx.voucherCode },
            data: { quota: { increment: 1 } },
          });
        }

        // If a coupon was used, restore its quota
        if (trx.couponCode) {
          await tx.coupon.update({
            where: { code: trx.couponCode },
            data: { quota: { increment: 1 } },
          });
        }

        // If points were used, restore them to the user's balance
        if (trx.point && trx.point > 0) {
          await tx.user.update({
            where: { id: trx.userId },
            data: { balancePoint: { increment: trx.point } },
          });
        }
      }

      // 4. After restoring all resources, update the status of all expired transactions
      const transactionIdsToExpire = expiredTransactions.map((t) => t.id);
      
      await tx.transaction.updateMany({
        where: {
          id: {
            in: transactionIdsToExpire,
          },
        },
        data: {
          status: "EXPIRED",
        },
      });
    });

    console.log(`[⌚ CRON] ${expiredTransactions.length} transactions have been successfully expired and resources restored. 💸`);

  } catch (error) {
    console.error("[⌚ CRON] Failed to process expired transactions:", error);
  }
};