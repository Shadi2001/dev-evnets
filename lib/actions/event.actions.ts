'use server'
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

export const getSimilarEventBySlug= async (slug: string)=> {
    try {
        await connectDB()

        const event = await Event.findOne({slug})
       return  event
            ? await Event.find({
                _id: { $ne: event._id },
                tags: { $in: event.tags }
            })
            : [];





    }catch(e) {
        return [];
    }
}