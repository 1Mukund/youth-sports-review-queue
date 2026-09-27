## Task 1. The roadmap call

### What I am building next: fix roster tagging when jersey numbers look alike

Three clubs filed the same complaint this week. A parent at Ridgeline, a coach at Brightwater
Lacrosse, a parent at Cobblestone Little League. Three different clubs, three different sports,
no connection to each other, and the same failure every time. Number 14 came back as number 4.
Number 1 came back as number 11. The Brightwater coach said it happened twice and both times the
digits were just swapped.

That is not three tickets. That is one bug showing up in three unrelated places, which makes it a
pattern rather than a complaint.

Then it connects to the dashboard. Our Reel Share Rate reads 92%, but the analytics note says it is
calculated only over reels a parent opened, and about 30% of reels are never opened at all. One of
the two reasons listed for not opening is that the thumbnail shows the wrong kid, and that it happens
most when jersey numbers look similar.

So the parents hit by this bug are sitting inside the 30% the metric leaves out. The number reads 92%
partly because it excludes the people we failed. A metric measured only over people who did not hit
the problem will always look healthy.

Three tickets is what reached us. A parent who opens a reel and sees someone else's child does not
usually file a ticket. They just stop opening. That behaviour is invisible to us everywhere except
in the unopened 30%.

### The ranking

**1. Roster tagging confidence check on visually similar jersey numbers.**
This is the only item in the pile with evidence from three independent accounts, a clear mechanism,
and a direct line to a number we already track. It is also the only one where the failure costs us
trust rather than convenience. A kid who was told their reel is coming and got someone else's clip
is a harder problem than a missing feature.

**2. Fix the notification send time on the weekly recap.**
The analytics note gives two reasons reels go unopened, and the other one is that the notification
arrives late at night. That is a scheduling change, not a rebuild, and it is aimed at the same 30%.
Cheap, and it makes the impact of item 1 easier to read because it removes the other variable.

**3. Find out what Ridgeline's board actually wants.**
Not livestreaming itself. Two weeks of discovery on the underlying ask, which I can start this week
and take into the renewal conversation.

### What I am not building next

**Livestreaming, for now.** Carla's own email says the highlight reels are a big part of why half her
parents renewed this year. The thing she is renewing on is the thing that is currently breaking, and
Ridgeline is one of the three clubs that filed a mis-tagging ticket this week. Building live video
while her parents are opening reels with the wrong child in them protects the renewal less than fixing
the reels does.

The evidence behind livestreaming is also the thinnest in the pile. It is one account's board opinion,
relayed twice through sales. Compare that with three unconnected clubs and a measurable 30% of reels
going unopened. I am weighting what people did over what one customer asked for, even though that
customer is our biggest.

I am not saying no. I am saying I will not commit a date on something this size in six weeks when I
cannot yet promise we would hit it. What I will commit to Carla is a date for the tagging fix, and
answers to three questions before her board meeting: what does the board expect livestreaming to
change, is this about distant family watching or about a competitor having it, and how many Ridgeline
families are opening their reels today.

**More editing controls.** 58% of parents named this as their biggest ask. Only 6% opened the Reel
Editor in ninety days and fewer than 1% finished an edit. Meanwhile the Share button is used on 90%
of recaps. What people do and what people say are pointing in opposite directions here.

I do not read the 58% as wrong. I read it as parents describing a problem in the language of a
solution. They are not asking to become video editors. They are asking for the reel to be right
without them having to fix it. Editing controls and correct tagging are two answers to the same
complaint, and one of them requires the parent to do the work.

Here is a way to test that I am right. Split the 6% who opened the editor by whether that family had
a mis-tagged clip that week. If the opens cluster there, the editor is being used as a repair tool,
not a creative one, and building more of it is building a better bandage.

**The app icon and the missing watermark.** Both real, both small, neither is why anyone leaves.
Parked with a reason rather than ignored. The icon complaint is worth logging because it points at
something larger, which is that we look like a soccer product while selling to lacrosse and baseball
clubs, but that is a brand conversation and not this cycle's build.
