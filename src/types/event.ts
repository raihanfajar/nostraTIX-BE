import { Category } from "../generated/prisma";

export interface IEventPictures {
	banner: Express.Multer.File;
	picture1: Express.Multer.File;
	picture2?: Express.Multer.File;
	picture3?: Express.Multer.File;
}

export interface ITicketCategory {
	name: string;
	description: string;
	price: number;
	seatQuota: number;
}

export interface ICreateEvent {
	organizerId: string;
	name: string;
	description: string;
	category: Category;
	countryId: number;
	cityId: number;
	location: string;
	startDate: Date;
	endDate: Date;
	files: {
		banner?: Express.Multer.File[];
		picture1?: Express.Multer.File[];
		picture2?: Express.Multer.File[];
		picture3?: Express.Multer.File[];
	};
	ticketCategories: ITicketCategory[];
	eventPictures: IEventPictures;
}
