import express from "express";
import {
	getAllCityByCountryIdController,
	getAllCountriescontroller,
	getCityByIdController,
	getCountryByIdController,
} from "../controllers/location.controller";

const locationRouter = express.Router();

locationRouter.get("/country", getAllCountriescontroller);
locationRouter.get("/city/:countryId", getAllCityByCountryIdController);
locationRouter.get("/country/:countryId", getCountryByIdController);
locationRouter.get("/city/one/:cityId", getCityByIdController);

export default locationRouter;
