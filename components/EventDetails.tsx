import React from 'react'
import {notFound} from "next/navigation";
import {EventAttrs} from "@/database";
import {getSimilarEventBySlug} from "@/lib/actions/event.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import {cacheLife} from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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


const EventDetails =async ({params}:{params:Promise<string>}) => {
    'use cache'
    cacheLife('hours')
    const  slug  = await params;

    const response = await fetch(`${BASE_URL}/api/events`);
    if (!response.ok) return notFound();

    const { events } = await response.json();

    const event: EventAttrs | undefined = events.find((e: EventAttrs) => e.slug === slug);
    if (!event) return notFound();

    const Booking = 10;
    const similarEvents: EventAttrs[] = await getSimilarEventBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p> {event.description}</p>
            </div>

            <div className="details">
                {/*Left Side - Event Content */}
                <div className="content">
                    <Image src={event.image} alt="Event Banner" width={800} height={800} />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{event.overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon='/icons/calendar.svg' alt="calender" label={event.date}/>
                        <EventDetailItem icon='/icons/clock.svg' alt="calender" label={event.time}/>
                        <EventDetailItem icon='/icons/pin.svg' alt="calender" label={event.location}/>
                        <EventDetailItem icon='/icons/mode.svg' alt="calender" label={event.mode}/>
                        <EventDetailItem icon='/icons/audience.svg' alt="calender" label={event.audience}/>
                    </section>
                    <EventAgenda agendItems={event.agenda}/>

                    <section className="flex-col-gap-2">
                        <h2>About The Organizer</h2>
                        <p>{event.organizer}</p>
                    </section>

                    <EventTags tags={event.tags}  />

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

                        <BookEvent eventId={event.title} slug={event.slug}/>
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
export default EventDetails
