# WebVerse user workspace

Open `/workspace/` on the existing Node server. For an isolated preview:

```sh
PORT=3011 npm start
```

The browser app is a presentation-focused prototype with local scripted responses. It makes no vendor, payment, booking, or language-model API calls. This implementation detail is intentionally absent from the product interface as requested.

## Presentation flow

1. Click **Find my kitchen mix**. The button fills the composer; press Send.
2. Three vendor quotes appear progressively. GoodHands requests payment information; a blocked branch and corrected enquiry appear in the activity log.
3. Click **See what happened** for the vendor conversations, or **Agent activity** for the event trail and decision graph.
4. Click **See it all together**, then Send. Product imagery transitions into the combined kitchen.
5. Request the itemized quotes to show a rejected premature booking followed by one approved enquiry per vendor.
6. Compare tab contains price bars and deposit terms. Your brief edits budget/style. The reset control cancels in-progress responses and resets the presentation.

Use `app.js` for scenario text, timing, product prices, and intent routes. The inspector in `activity.js`/`activity.css` is independent. Main styles live in `style.css`. All files stay in this directory so the three vendor sites and their working API remain untouched.

## Images

Four images were generated using built-in ImageGen: `assets/floor.png`, `assets/sink.png`, `assets/table.png`, and `assets/room.png`. The final room image was generated with all three individual product images supplied as references. Prompts and generation metadata are in `artifacts/webverse-imagegen-prompts.json` at the repository root.

## Validation

Checked in Chrome at desktop width and 390px mobile width: staged chat replies, comparison, blocked disclosure, room reveal, activity views, keyboard tabs, budget changes, and cancellation on reset. Workspace scripts pass `node --check`; the existing repository check passes all seven backend tests.

The workspace lives at `/workspace/`; the existing `/` directory and vendor routes remain owned by the separate vendor-site implementation.
