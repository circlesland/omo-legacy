import {prisma} from "./prisma";

export class UserRepo
{
    public async ensureUserExists(name: string)
    {
        let user = await prisma.user.findOne({
            where: {
                email: name
            }
        });
        if (!user) {
            user = await prisma.user.create({
                data:{
                    createdAt: new Date(),
                    email: name,
                    timezoneOffset: -120
                }
            })
        }

        return user;
    }
}