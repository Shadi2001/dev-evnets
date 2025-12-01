'use client'

import React, {useState} from 'react'

const BookEvent = () => {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
