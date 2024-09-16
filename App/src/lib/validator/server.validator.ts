import { any, string, z } from "zod"

export const creaeServerValidator = z.object({
    name: z.string({ required_error: "name minimum contains at least two characters" }).min(2, "name minimum contains at least two characters"),
})

export type CreateServerValidatorRequest = z.infer<typeof creaeServerValidator>


export const UpdateServerValidator = z.object({
    name: z.string({ required_error: "name minimum contains at least two characters" }).min(2, "name minimum contains at least two characters"),
})

export type UpdateServerValidatorRequest = z.infer<typeof UpdateServerValidator>


