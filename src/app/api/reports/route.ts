import {prisma} from "@/lib/prisma"
import {NextRequest, NextResponse} from "next/server"

export async function GET() {
    const reports = await prisma.report.findMany({
        orderBy:{createdAt:"desc"},
    });
    return NextResponse.json(reports);
}

export async function POST(request:NextRequest){
    const data = await request.json();
    const newReport = await prisma.report.create({
        data:{
            reporter:data.reporter,
            title:data.title,
            description:data.description,
            imageUrl:data.imageUrl,
        }
    })
    return NextResponse.json(newReport);
}