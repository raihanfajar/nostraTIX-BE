import { Request, Response } from "express";
import { getAllCityByCountryIdService, getAllCountriesService } from "../services/location.service";

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
