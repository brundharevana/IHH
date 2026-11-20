# End of tour: quiz, ticket, story

After the last chapter: an optional quiz, a ticket the visitor can save as a PNG, and a link to IHH's story form. Nothing the visitor does is stored or sent.

| Item | Where |
|---|---|
| Dialog (quiz, ticket, story) | `app/src/tour/end/EndOfTour.jsx` |
| Quiz questions (from verified facts of chapters the visitor saw) | `app/src/tour/end/questions.js`, `quiz.js` |
| Ticket | `app/src/tour/end/ticket.js` |
| IHH links | `app/src/tour/end/links.js` (`END_LINKS`) |

Open items: `feedbackUrl`, `feedbackQrImage` and `storyUrl` are `null` until IHH supplies them; the page shows marked placeholders. How to set them: [WordPress guide, End-of-tour links](../../revamp/wordpress-embed.md#end-of-tour-links).

Tests: `app/src/tour/end/quiz.test.js`, `ticket.test.js`, `node e2e/end-of-tour.mjs`.

Related: [guided tour](guided-tour.md)
