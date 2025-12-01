import React from 'react'
import {notFound} from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import {getSimilarEventBySlug} from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import {EventAttrs} from "@/database";


const EventDetailItem=({icon,alt,label}:{icon:string; alt:string;label:string})=>(
    <div className="flex-row-gap-2">
    <Image src={icon} alt={alt} width={17} height={17}/>
        <p>{label}</p>
</div>)

const EventAgenda=({agendItems}:{agendItems:string[] }) =>(
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendItems.map((item) => (
                <li key={item}>{item}</li>
                ))}
        </ul>
    </div>
)

const EventTags=({tags}:{tags:string[]})=>(
    <div className="flex flex-row-gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}

    </div>
)


const EventDEtails =async ({params}:{params: Promise<{slug:string}>}) => {



    const BASE_URL=process.env.NEXT_PUBLIC_BASE_URL
    const {slug} = await params
    const request=await fetch(`${BASE_URL}/api/events/${slug}`)
    const {events}=await request.json()
    const Booking=10;

    const similarEvents :EventAttrs[] =await getSimilarEventBySlug(slug);

    if(!events) return notFound()

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p> {events[0].description}</p>
            </div>

            <div className="details">
                {/*Left Side - Event Content */}
                <div className="content">
                    <Image src={events[0].image} alt="Event Banner" width={800} height={800} />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{events[0].overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon='/icons/calendar.svg' alt="calender" label={events[0].date}/>
                        <EventDetailItem icon='/icons/clock.svg' alt="calender" label={events[0].time}/>
                        <EventDetailItem icon='/icons/pin.svg' alt="calender" label={events[0].location}/>
                        <EventDetailItem icon='/icons/mode.svg' alt="calender" label={events[0].mode}/>
                        <EventDetailItem icon='/icons/audience.svg' alt="calender" label={events[0].audience}/>
                    </section>
    <EventAgenda agendItems={events[0].agenda}/>

                    <section className="flex-col-gap-2">
                    <h2>About The Organizer</h2>
                        <p>{events[0].organizer}</p>
                    </section>

                    <EventTags tags={events[0].tags}  />

                </div>

                {/*Right Side - Booking form */}
    <aside className="booking">
            <div className="signup-card">
                <h2>Book You Spot</h2>
                {Booking>0? (
                    <p className="text-sm">
                        join {Booking} People who have already booked their spot
                    </p>
                ):(
                    <p className="text-sm">
                        Be The First to book your spot
                    </p>
                )}

                <BookEvent />
            </div>
    </aside>
            </div>
            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((similarEvent:EventAttrs) => (
                        <EventCard key={similarEvent.title} {...similarEvent} />
                    ))}
                </div>
            </div>
        </section>

    )
}
export default EventDEtails
