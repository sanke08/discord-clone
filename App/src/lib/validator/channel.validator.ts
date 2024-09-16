import { z } from "zod";



export const CreateChannelValidator = z.object({
    name: z.string().min(3, "name must contain atleast 3 characters"),
    type: z.string({ required_error: "channel type required" })
})

export type CreateChannelValidatorRequset = z.infer<typeof CreateChannelValidator>


export const UpdateChannelValidator = z.object({
    name: z.string().min(3, "name must contain atleast 3 characters"),
    type: z.string().optional()
})

export type UpdateChannelValidatorRequset = z.infer<typeof UpdateChannelValidator>