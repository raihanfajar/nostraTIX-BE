import prisma from "../config";

export const getAllCountriesService = async () => {
	return await prisma.country.findMany();
};

export const getAllCityByCountryIdService = async (countryId: number) => {
	return await prisma.city.findMany({
		where: { countryId: countryId },
	});
};
