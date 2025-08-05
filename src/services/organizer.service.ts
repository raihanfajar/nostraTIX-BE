import prisma from "../config";
import { Organizer } from "../generated/prisma";
import { ApiError } from "../utils/ApiError";
export const getOrganizerProfileService = async (body: Pick<Organizer, 'id'>) => {

    const targetOrganizer = await prisma.organizer.findUnique({
        where: { id: body.id },
    })

    if (!targetOrganizer) throw new ApiError(404, "Organizer not found");

    const { name, email, profilePicture, description, } = targetOrganizer;

    return { status: "success", message: "Organizer found", details: { name, email, profilePicture, description } }
}

export const patchOrganizerProfileService = async (body: Pick<Organizer, 'id' | 'name' | 'email' | 'description'>) => {
    const targetOrganizer = await prisma.organizer.findUnique({
        where: { id: body.id },
    })

    if (!targetOrganizer) throw new ApiError(404, "Organizer not found");

    const emailExists = await prisma.organizer.findUnique({ where: { email: body.email } })
    if (emailExists && emailExists.id !== body.id) throw new ApiError(400, "Email already exists");

    const updatedOrganizer = await prisma.organizer.update({
        where: { id: body.id },
        data: { name: body.name, email: body.email, description: body.description },
    })

    return { status: "success", message: "Organizer updated", details: updatedOrganizer }
}