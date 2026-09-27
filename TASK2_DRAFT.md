## Task 2. The spec: roster confidence check on ambiguous jersey numbers

### The outcome

A parent never opens their child's reel and finds another child in it.

Measured as: the share of published reels containing at least one clip matched to the wrong roster
name goes to near zero, and the share of published reels opened by the intended family within 72
hours rises from whatever the real baseline turns out to be. We do not currently measure that
baseline, which is part of the problem. Establishing it is in scope and described below.

### The core idea

Today roster tagging reads a jersey number off the footage and matches it to a roster name. When the
number is hard to read, it still picks someone.

The change: before a clip is published, check whether the match is safe. It is unsafe when the number
the system read could plausibly be a different number that is also on that same roster. If it is
unsafe, the clip does not publish on its own. It goes to the coach for one tap.

The roster condition is the important part. If a team has a number 14 and no number 4, then misreading
14 as 4 matches nobody and the clip is simply dropped, which is a safe failure. The damaging case is
only when both numbers exist on the same roster, because then a wrong read still lands on a real child.
That is exactly what happened in all three tickets. Ridgeline had a 14 and a 4. Cobblestone had a 1 and
an 11. Brightwater had two numbers with the same digits in a different order.

Scoping the check this way means coaches only review clips that could actually go to the wrong child,
rather than every clip the model felt unsure about.

### How it works, step by step

1. Tagger reads a jersey number from the clip and returns its confidence in that read.
2. System builds the confusable set for that read against that team's roster only. Confusable means:
   the same digits in a different order (14 and 41), one number contained in the other (1 and 11, 4 and
   14), or a single digit substitution from a defined lookalike list that the team can extend.
3. If the confusable set against that roster is empty, publish as normal. Nothing changes for the
   majority of clips.
4. If the confusable set is not empty, or the tagger's confidence sits below the review threshold, the
   clip is held and added to that coach's review queue. It is not published.
5. Coach opens the queue and sees, for each held clip, the frame where the jersey is most visible, the
   system's guess, and the other candidates from the roster. One tap to confirm, reassign, or discard
   as not our player.
6. Confirmed and reassigned clips publish into the right child's reel and become eligible for the
   weekly recap. Discarded clips are dropped.
7. Clips still unreviewed when the weekly recap assembles stay held. They do not publish.

### Where a human stays in the loop

The coach, and specifically the coach rather than the parent.

The coach knows the roster and was at the game, so they can settle the question in a second. A parent
can only tell us after they have already seen the wrong child, which is the moment we are trying to
prevent. A parent-facing report flow treats the symptom after the damage.

The coach's job is one tap per held clip. If that is more than a handful per week per team, the
threshold is wrong and that is a signal we watch, not a burden we accept.

### Fail closed, on purpose

If a coach never opens the queue, held clips do not publish. They are excluded from the child's reel
and from the weekly recap.

This is a deliberate trade. Sending nothing is a gap. Sending another child is a breach of trust with
a family, and based on the unopened 30% it is the thing that makes parents stop opening altogether.
We take the gap.

Two guards on that choice:
- If every clip for a child is held, we do not send that child an empty reel. We send nothing and tell
  the coach which children have no reel this week and why.
- A team whose queue has gone unreviewed for two consecutive weeks is surfaced to the account owner,
  because that is a customer health problem, not a product bug.

### In scope

- Confusable set construction against the team roster.
- Review threshold on tagger confidence, with a single owner and a defined review cadence.
- Coach review queue: list with a count, per clip review, confirm, reassign, discard.
- Hold behaviour, including exclusion from the weekly recap.
- The empty reel guard.
- Instrumentation, listed below. This ships with the feature, not after it.

### Out of scope, explicitly

- No change to the computer vision model that detects the number. We are adding a gate around it, not
  retraining it.
- No parent-facing report a mistake flow this cycle.
- No changes to the Reel Editor.
- No livestreaming.
- No change to notification send time. That is a separate item on the roadmap and mixing it in here
  would make both impossible to measure.
- No app icon or watermark work.

### Instrumentation, shipped with the feature

The current Reel Share Rate of 92% is calculated only over reels a parent opened. It cannot see the
failure we are fixing, because the parents who hit it are inside the 30% who never opened. Fixing the
feature without fixing the measurement leaves us unable to prove anything.

Add, measured over all published reels rather than opened ones:
- Share of published reels opened by the intended family within 72 hours.
- Share of published reels containing at least one clip that was held and then corrected.
- Wrong child tickets per thousand published clips.
- Queue completion rate: held clips reviewed before the recap assembles, by team.
- Clips held per team per week, median and worst case.

Keep the existing 92% Share Rate on the dashboard next to the new open rate. Leaving it visible makes
the correction obvious instead of quietly replacing a number that leadership has been reading for
months.

### Who owns the threshold

The product manager owns the review threshold value. It is reviewed monthly against two counters that
pull in opposite directions: wrong child tickets per thousand published clips, and queue completion
rate. Engineering does not change it silently and it is not left to drift with a model update. Any
change to it is logged with a date and a reason.

### Acceptance criteria

Someone should be able to test each of these.

Positive:
1. Given a roster containing both 4 and 14, when the tagger reads 4 on a clip, the clip is held and
   appears in that coach's review queue rather than publishing.
2. Given a roster containing 14 and no 4, when the tagger reads 14, the clip publishes without review.
3. Given a held clip, when the coach taps confirm, the clip publishes to that child's reel and becomes
   eligible for the next weekly recap.
4. Given a held clip, when the coach reassigns it to a different roster name, the clip publishes to
   that child instead and not to the original.
5. Given a held clip that is never reviewed, when the weekly recap assembles, the recap is sent without
   that clip and the clip remains held.
6. The coach review queue displays a count of clips awaiting review and that count matches the number
   of held clips for that team.

Negative, meaning these must not happen:
7. No clip whose confusable set against the roster is non-empty is ever published without a human
   confirmation.
8. No reel is sent containing a clip a coach marked as the wrong child or discarded.
9. No reel is sent to a family when every clip for that child is still held. Nothing is sent instead.

### The top two ways this fails once it ships

**Failure one: the threshold is too loose and wrong child clips still get through.**
We would be shipping a review queue that creates work without preventing the thing it exists to
prevent.
What catches it: wrong child tickets per thousand published clips does not fall after launch, and the
intended family open rate within 72 hours stays flat. Both are new counters above. If ticket rate is
unchanged four weeks after launch, the confusable rules are missing real cases and the first place to
look is which number pairs appear in the tickets but not in our lookalike list.

**Failure two: the threshold is too tight, queues flood, and coaches stop reviewing.**
This one is worse because it looks like success. Wrong child tickets go to zero, but only because
clips are being held and never published. Reels get thinner, families get less, and nobody files a
ticket about a highlight they never knew existed.
What catches it: queue completion rate falling, median clips held per team per week climbing, and the
count of children receiving no reel in a week rising. The third of those is the one that matters, and
it is the reason the empty reel guard reports to the coach rather than failing silently.

### Rollback

If queue completion rate falls below a level I will set after the first two weeks of real data, held
clips revert to publishing automatically with the confidence score and confusable set logged but not
enforced. That keeps the measurement running so we can retune the threshold, while stopping the
feature from quietly starving reels.

I am not setting that number now. Setting a rollback trigger before seeing a single week of real queue
behaviour would be inventing a threshold to look decisive.

### Assumptions I am making

Flagged rather than stated as fact, because none of these are in the materials:
- That the tagger returns a usable confidence value per read. If it does not, that is the first
  engineering question and it changes the shape of step 4.
- That rosters include jersey numbers already, since tagging matches against them today.
- That coaches already receive some weekly prompt tied to the recap, which the queue reminder can
  attach to rather than becoming a new channel.
