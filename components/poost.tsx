'use client'
import posthog from 'posthog-js'

export default function Home() {
    return (
        <div>
            <button onClick={() => posthog.capture('test_event')}>
                Click me for an event
            </button>
        </div>
    );
}