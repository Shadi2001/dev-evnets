'use client'

import React, {useState} from 'react'
import {createBooking} from "@/lib/actions/bookings.actions";
import posthog from "posthog-js";

const BookEvent = ({eventId,slug}:{eventId:string,slug:string}) => {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const {success} = await createBooking({eventId,slug,email})

        if(success){
            setSubmitted(true)
            posthog.capture('event_booked',{eventId,slug,email})
        }else {
            console.log("Booking Creation Failed")
            posthog.captureException("Booking Creation Failed")
        }

        e.preventDefault();



       setTimeout(() => {
           setSubmitted(true)
       },1000)
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank You For Signing Up</p>
            ):(
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Your Email Address"
                        />

                    </div>

                    <button type="submit" className="button-submit">Submit</button>

                </form>
            )}

        </div>
    )
}
export default BookEvent
