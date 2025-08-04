import prisma from "../config";
import { Organizer } from "../generated/prisma";
import { ApiError } from "../utils/ApiError";
export const getOrganizerProfileService = async (body: Pick<Organizer, 'id'>) => {

    const targetOrganizer = await prisma.organizer.findUnique({
        where: { id: body.id },
    })

    if (!targetOrganizer) throw new ApiError(404, "Organizer not found");

    console.log(targetOrganizer);

    const { name, email, profilePicture, description, } = targetOrganizer;

    return { status: "success", message: "Organizer found", details: { name, email, profilePicture, description } }
}