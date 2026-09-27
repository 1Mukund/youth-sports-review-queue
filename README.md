# Roster review queue

A working prototype built for the Ajaia Product Manager assessment (https://ajaia.ai).

**Live: https://1mukund.github.io/youth-sports-review-queue/**

## What it does

SidelineReel matches a jersey number in game footage to a name on the team roster, so each
highlight lands in the right child's reel. When the number is hard to read it still picks
someone, and three clubs filed the same complaint this week because of it.

This prototype is the review queue that stops that. It opens on a choice, because the point of
the feature is the difference between two outcomes.

- **Ship it as we do today.** No gate. All three clips publish on whatever the tagger read, two
  of three land on the wrong child, and the dashboard still reads 92 percent.
- **Ship it with the confidence gate.** The same clips are held. The coach confirms, reassigns
  or discards each one. Anything unreviewed stays out of the weekly recap.

## The idea worth noting

A clip is only held when the number the tagger read has a look-alike that is **also on that same
roster**. If a team has a 14 and no 4, misreading it matches nobody and the clip is dropped,
which is a safe failure. The damage only happens when both numbers exist on one roster, which is
exactly what happened in all three support tickets. Scoping it that way means coaches only review
clips that could genuinely reach the wrong child.

## Safeguards

Fails closed, so an unreviewed clip is never published. No child name, number or thumbnail in any
notification. A coach sees only their own roster. Every confirm, reassign and discard is written
to an audit trail, because reassignment moves a real child's footage between families. A US
product filming under-13s falls under COPPA, so these are written as requirements rather than
nice to have.

## Running it

Open the link. There is no build step.

Plain HTML, CSS and JavaScript, no framework and no dependencies. Content Security Policy blocks
all external and inline scripts, no referrer is sent, every rendered value is escaped, and the
page loads no third party code, fonts or trackers.

## Assumptions

Names and clips are sample data, not real children. The three jersey collisions are the ones
described in the tickets: 14 against 4, 1 against 11, and a reversed-digit pair. There is no real
video, computer vision or backend here; those are the parts the engineering team owns and the
parts the written spec covers.

Built by Balmukund Tripathi.
