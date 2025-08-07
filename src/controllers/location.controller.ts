import { Request, Response } from "express";
import { getAllCityByCountryIdService, getAllCountriesService, getCityByIdService, getCountryByIdService } from "../services/location.service";

export const getAllCountriescontroller = async (req: Request, res: Response) => {
    const result = await getAllCountriesService();
    res.status(201).send(result);
};

export const getAllCityByCountryIdController = async (req: Request, res: Response) => {
    const {countryId} = req.params
    const id = Number(countryId)
    const result = await getAllCityByCountryIdService(id);
    res.status(201).send(result);
};

export const getCountryByIdController = async (req: Request, res: Response) => {
    const {countryId} = req.params
    const id = Number(countryId)
    const result = await getCountryByIdService(id);
    res.status(200).send(result);
}

export const getCityByIdController = async (req: Request, res: Response) => {
    const {cityId} = req.params
    const id = Number(cityId)
    const result = await getCityByIdService(id);
    res.status(200).send(result);
}