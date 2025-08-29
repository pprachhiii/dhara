import {prisma} from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET({params}:{params:{id:string}}){
    try{
      const report =await prisma.report.findUnique({
        where:{id:params.id}
     });
      return NextResponse.json(report);
    }catch{
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
}

export async function PATCH(request:NextRequest, {params}:{params:{id:string}}){
    const data = await request.json();
    try{
        const updatedReport = await prisma.report.update({
        where:{id:params.id},
        data:{
            reporter:data.reporter,
            title:data.title,
            description:data.description,
            imageUrl:data.imageUrl,
        }
        })
        return NextResponse.json(updatedReport);
    }catch  {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }    
}

export async function DELETE(request:NextRequest, {params}:{params:{id:string}}){
  try{
    await prisma.report.delete({
        where:{id:params.id},
    })
    return NextResponse.json({ message: "Report deleted successfully" });
  } catch  {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}