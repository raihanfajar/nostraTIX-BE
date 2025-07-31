import { Category } from "../generated/prisma";

export interface query {
	name?: string;
	category?: Category;
	countryId?: number;
	cityId?: number;
	location?: string;
	limit?: number;
	page?: number;
}
