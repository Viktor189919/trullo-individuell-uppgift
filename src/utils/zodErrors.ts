import type { ZodError } from "zod"

export function zodErrorHandler(error : ZodError) {
    return error.issues.reduce((acc, issue) => {
                const pathName = (issue.path[0] || "pathName") as string;
                acc[pathName] = issue.message
                return acc
            }, {} as Record<string, string>)
}