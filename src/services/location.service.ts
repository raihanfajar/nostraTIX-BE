import prisma from "../config";

export const getAllCountriesService = async () => {
	return await prisma.country.findMany();
};

export const getAllCityByCountryIdService = async (countryId: number) => {
	return await prisma.city.findMany({
		where: { countryId: countryId },
	});
};

export const getCountryByIdService = async (countryId: number) => {
	return await prisma.country.findFirst({
		where: { id: countryId },
	});
}

export const getCityByIdService = async (cityId: number) => {
	return await prisma.city.findFirst({
		where: { id: cityId },
	});
}