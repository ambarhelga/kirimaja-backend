import { z } from 'zod';

const employeeBranchDataSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        })
        .min(1, 'Name must be at least 1 characters long'),
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email({
            message: 'Email must be a valid email address',
        }),
    phone_number: z
        .string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be a string',
        })
        .min(10, 'Phone number must be at least 1 characters long'),
    branch_id: z
        .number({
            required_error: 'Branch ID is required',
            invalid_type_error: 'Branch ID must be a number',
        })
        .int('Branch ID must be an integer')
        .min(1, 'Branch ID must be at least 1'),
    type: z
        .string({
            required_error: 'Type is required',
            invalid_type_error: "Type must be either 'admin' or 'staff'",
        })
        .min(1, 'Type must be at least 1 characters long'),
    role_id: z
        .number({
            required_error: 'Role ID is required',
            invalid_type_error: 'Role ID must be a number',
        })
        .int('Role ID must be an integer')
        .min(1, 'Role ID must be at least 1'),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(6, 'Password must be at least 6 characters long'),
    avatar: z.string().optional().nullable(),
});

export class CreateEmployeeBranchDto {
    static schema: z.ZodObject<any> = employeeBranchDataSchema;

    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly phone_number: string,
        public readonly branch_id: number,
        public readonly type: string,
        public readonly role_id: number,
        public readonly password: string,
        public readonly avatar?: string | null,
    ) {}
}
