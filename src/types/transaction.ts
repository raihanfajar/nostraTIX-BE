export interface ICreateTransaction {
	userId: string;
	eventId: string;
	voucherCode?: string;
	couponCode?: string;
	point?: number;
	quantity: number;
	ticketEventCategoryId: number;
}

export interface IUploadPaymentProof {
	file: Express.Multer.File;
	transactionId: string;
	userId : string
}

export interface ISetStatusTransaction{
	status: string;
	transactionId: string;
}

export interface IVoucherCreate {
  code: string;
  eventId: string;
  discount: number;
  quota: number;
  maxDiscount: number;
  expiredDate: Date;
  organizerId: string;
}