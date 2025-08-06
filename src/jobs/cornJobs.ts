import cron from 'node-cron';
import { expireTransactionsJob } from './transactionJobs/uploadPaymentProofJobs';
import { confirmationTransactionOrganizer } from './transactionJobs/cofirmationTransactionOrganizer';

export const expiryTransactionSchedule = () => {
    cron.schedule('* * * * *', async () => {
        console.log('[⌚ CRON] Executing expiry transaction job...');
        await expireTransactionsJob();
        await confirmationTransactionOrganizer();
    });
}