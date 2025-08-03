import express from "express";
import {
	getAllCityByCountryIdController,
	getAllCountriescontroller,
} from "../controllers/location.controller";

const locationRouter = express.Router();

locationRouter.get("/country", getAllCountriescontroller);
locationRouter.get("/city/:countryId", getAllCityByCountryIdController);

export default locationRouter;
