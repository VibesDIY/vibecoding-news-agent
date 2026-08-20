# r/vibecoding round-up 2026-08-20

Generated 2026-08-20T01:19:59.750Z by the scheduled generator in `vibe/`.

**This is analysis, not a post. The published write-up is a separate pass with a stronger model, and a person edits it before it goes anywhere.**

13 links, 3 of them carrying more discussion than votes. Working below the round-up: 39 claims, 15 counted tools, 0 confirmed, from 3 corpus answers.

Somebody has to read the whole subreddit so you do not have to. That somebody is a program, which reads all of it, has no opinions worth having, and hands the good bits to a person who does. What follows is the good bits, with the arguing left in.

---

The shopping list nobody puts in the demo video: secure auth, database rules, backups, compliance. Framing that as the point where apps "break" gets it backwards, and judging by how far the replies ran ahead of the votes, plenty of people know it. That list is the job.

> Vibe coding is great for building quick MVPs, but I feel many apps break once they face real-world requirements. The demo may work, but production needs secure auth, database rules, deployment, monitoring, testing, backups, complianc...

[Can vibe-coded apps actually survive production?](https://reddit.com/r/vibecoding/comments/1tumgz0/) · r/vibecoding · u/yash_maanikya · 2 points · 40 comments · more talk than votes

*Found asking: What problems do people report after deploying an app they vibe coded? What breaks once real users are on it?*

---

Maintenance is the word missing from every LinkedIn victory lap about the full stack app someone shipped last weekend, and this poster noticed. Deploying is the easy half; the question is who patches the thing in month seven. The answers below are less confident than the posts.

> I have vibe coded a few things myself, and constantly see linkedin posts from nontechnical folks talking about how they are now deploying full stack applications for their business. I'm confused - how is this stuff maintained? Is it ...

[Are you guys actually deploying vibe coded stuff?](https://reddit.com/r/vibecoding/comments/1vmqzq6/) · r/vibecoding · u/JennySurfs · 32 points · 92 comments

*Found asking: What problems do people report after deploying an app they vibe coded? What breaks once real users are on it?*

---

Five tools get named for the easy part and not one for what comes after. That gap pulled far more replies than the upvote count would predict, and the answers keep landing in the same place: shipping fast and staying shipped are separate skills.

> Vibe coding has made it crazy fast to go from idea to working app. But I'm wondering what happens after that first version is live. For people who have built something with Cursor, Lovable, Bolt, Replit, Claude, etc....

[What happens when your vibe-coded app starts getting real users?](https://reddit.com/r/vibecoding/comments/1v7m1hj/) · r/vibecoding · u/Sea_Faithlessness198 · 2 points · 15 comments · more talk than votes

*Found asking: What problems do people report after deploying an app they vibe coded? What breaks once real users are on it?*

---

Thirty minutes is the whole runway here. If the bare bones aren't running by then, this poster drifts off to the next idea, and two thirds of their projects die that way. Framed as a tooling failure, but that abandonment rate sounds like an attention budget, and it's worth asking which one is actually broken.

> I abandon around 2/3 of vibe coding projects I start due to the inability of the platform to produce a working app - I’m not talking about landing pages. Roughly speaking, if it takes more than 30 mins to get the bare bones running, I start drifting onto ot...

[% of projects abandoned?](https://reddit.com/r/vibecoding/comments/1mpyhma/) · r/vibecoding · u/last_barron · 19 points · 71 comments

*Found asking: Why do people say they abandoned, rewrote or gave up on a vibe coded project?*

---

Nobody audits their own subscriptions, which is how a pile of AI assistants reaches $327 a month before anyone does the arithmetic. The votes here sat at zero while the replies kept arriving, which fits: the finding is duller than "hidden cost." Recurring charges aren't hidden, they're just boring to look at.

> Been building my SaaS solo for 2 years. Early on I threw every AI coding tool at my workflow thinking it'd make me faster. It did ! but my monthly AI bill crept up to $327. I didn't notice until I actually...

[The hidden cost of AI coding tools nobody talks about (and how I fixed mine)](https://reddit.com/r/vibecoding/comments/1uvo0o5/) · r/vibecoding · u/Proper_Violinist1371 · 0 points · 8 comments · more talk than votes

*Found asking: What do people say about unexpected costs, token spend or API bills from AI coding tools?*

---

Fifty dollars and three weeks with Lovable buys you a shipped app and no working idea of what any of it does, which holds up beautifully until a user mentions something broke. That isn't a debugging problem, it's a comprehension problem, and you can't prompt your way back into a codebase you never read.

> So you spent three weeks vibecoding with Lovable. You ship your app. You're proud of yourself - with just $50 you managed to build and launch your first real app. Users seem happy. Life is good lol.Then someone cas...

[The problem with vibe coding: debugging in production is a nightmare](https://reddit.com/r/vibecoding/comments/1o9sprj/) · r/vibecoding · u/arjy0 · 19 points · 94 comments

*Found asking: What problems do people report after deploying an app they vibe coded? What breaks once real users are on it?*

---

A retry loop is the villain here, and it's the right villain: nothing runs up a bill faster than code that keeps politely asking again. Collecting other people's scars before you earn your own is the cheapest research available.

> Hey, early stage founder here trying to avoid expensive mistakes before I make them. Talking to other devs and the one thing that keeps coming up is unexpected API bills. A retry loop here...

[Building an AI product and terrified of runaway API costs. What have you been burned by?](https://reddit.com/r/vibecoding/comments/1tpxtsg/) · r/vibecoding · u/thisismetrying2506 · 6 points · 4 comments

*Found asking: What do people say about unexpected costs, token spend or API bills from AI coding tools?*

---

That 80-90% number keeps showing up with unnerving consistency, which suggests it isn't a plateau so much as the point where the remaining work stops being describable in a prompt. Asking why is at least an improvement on generating another feature nobody can debug.

> Why is a vibe coded project stuck at 80-90% ?

[Why is a vibe coded project stuck at 80-90% ?](https://reddit.com/r/nocode/comments/1mx884d/) · r/vibecoding · u/anchit_rana · 2 points · 0 comments

*Found asking: Why do people say they abandoned, rewrote or gave up on a vibe coded project?*

---

A product manager for SaaS startups is the one saying nobody runs the numbers before the AI feature ships. That is the part worth sitting with: the person in the room where it gets approved has watched the cost question simply not come up.

> I work as a PM for SaaS startups and when new AI tools get added I don't think there is a big consideration for costs as scale occurs (or will occur, hopefully). I'm thinking along the lines of those who are shipping fa...

[How are you thinking about AI API costs if your project scales?](https://reddit.com/r/vibecoding/comments/1rx9cds/) · r/vibecoding · u/NeoTree69 · 1 points · 0 comments

*Found asking: What do people say about unexpected costs, token spend or API bills from AI coding tools?*

---

Whiplash is the real find here: the same employers who ordered staff to use AI for everything are now metering it. A "full 180" that fast means nobody priced the enthusiasm phase, and the invoice showed up before the workflow did.

> Just like everyone else, I've been seeing the recent news about how AI bills have been skyrocketing for companies. I've been seeing people Reddit posts / comments about how their companies have done a full 180 from "use AI for everything" to "limit ...

[How are people managing AI costs?](https://reddit.com/r/vibecoding/comments/1u0uddq/) · r/vibecoding · u/Excellent_Knee_7109 · 1 points · 2 comments

*Found asking: What do people say about unexpected costs, token spend or API bills from AI coding tools?*

---

Framing the whole genre as a choice between artisanal-teapot snobbery and "I used to run Bitcoin scams" testimonial is unkind and also accurate. The question underneath is boringly reasonable: show one of these that somebody was still patching in month twelve.

> It's either "Look at them vibe coding an app that was not hand crafted like a unique Japanese tea pot, that requires a unique handjob finish." Or it is, "I used to run Bitcoin scams...

[Has anyone actually maintained a vibe coded code-base 12 months after launch? What did it look like?](https://reddit.com/r/webdev/comments/1vnx44m/) · r/vibecoding · u/prolific_user · 1 points · 0 comments

*Found asking: Why do people say they abandoned, rewrote or gave up on a vibe coded project?*

---

> I built a small app with OpenAI and Anthropic APIs. At first it was just a fun project. Ship fast. Use the best models. Make the UX feel magical. Then people actually started usin...

[Any other vibe coders accidentally build something that works… and then get destroyed by AI costs?](https://reddit.com/r/vibecoding/comments/1thejay/) · r/vibecoding · u/Thonwalo · 0 points · 6 comments

*Found asking: What do people say about unexpected costs, token spend or API bills from AI coding tools?*

---

> Founder of Server4Agent (agent-app hosting), flagging that upfront. No link, not selling, genuinely want to hear from people who've actually shipped a...

[The weekend prototype works great on your laptop - what actually goes wrong the first time you let it run unattended for real users?](https://reddit.com/r/vibecoding/comments/1v8c6y1/) · r/vibecoding · u/marcin_michalak · 0 points · 2 comments

*Found asking: What problems do people report after deploying an app they vibe coded? What breaks once real users are on it?*

---


Mention counts below are index-wide. They measure how much r/vibecoding discusses each tool overall, not how it came up in the questions behind this report.

## Counted and confirmed

| Entity | Mentions | Sentiment | Checked |
|---|---|---|---|

## Counted, not yet checked

| Entity | Mentions | Sentiment |
|---|---|---|
| claude | 17573 | 0.25 |
| claude-code | 11275 | 0.332 |
| cursor | 8322 | 0.198 |
| codex | 6563 | 0.264 |
| chatgpt | 4550 | 0.139 |
| gemini | 4175 | 0.143 |
| lovable | 3444 | 0.089 |
| vscode | 2501 | 0.164 |
| supabase | 2493 | 0.181 |
| copilot | 2345 | 0.128 |
| anthropic | 2034 | -0.043 |
| vibe-coding | 1843 | 0.129 |
| replit | 1775 | 0.069 |
| github | 1766 | 0.158 |
| antigravity | 1683 | 0.175 |

## Leads

Claims pulled from a synthesis. Pointers to threads, not measurements.

- **Bug fixing cost** Bugs are disproportionately expensive to fix compared to the time saved writing the code, prompting some to abandon AI-enhanced projects. [source](https://reddit.com/r/vibecoding/comments/1rp2177/magic_of_vibe_coding_most_still_do_not_get_it/o9i7fk3/) [source](https://reddit.com/r/vibecoding/comments/1vo6dfr/why_people_say_that_tokenmaxxing_is_a_bad_thing/p3n8t6l/)
- **Bug fixing costs** AI-generated bugs can become too expensive to fix, leading to abandonment or rewriting. [source](https://reddit.com/r/vibecoding/comments/1rp2177/magic_of_vibe_coding_most_still_do_not_get_it/o9i7fk3/) [source](https://reddit.com/r/vibecoding/comments/1vo6dfr/why_people_say_that_tokenmaxxing_is_a_bad_thing/p3n8t6l/)
- **Code readability issues** People abandon projects when the code becomes unreadable or un-fixable as it grows beyond a certain size. [source](https://reddit.com/r/vibecoding/comments/1ov5opt/whats_the_best_ai_for_vibe_coding_for_someone_who/nojmyjw/) [source](https://reddit.com/r/vibecoding/comments/1o9lcfh/do_you_need_to_understand_the_code_ai_writes/nk4lq5p/) [source](https://reddit.com/r/vibecoding/comments/1sm6rtj/gpt_really_looked_at_1000_lines_of_logic_and/ogefyf5/)
- **Code readability** People abandon projects when they find the code unreadable or un-fixable. [source](https://reddit.com/r/vibecoding/comments/1ov5opt/whats_the_best_ai_for_vibe_coding_for_someone_who/nojmyjw/) [source](https://reddit.com/r/vibecoding/comments/1o9lcfh/do_you_need_to_understand_the_code_ai_writes/nk4lq5p/) [source](https://reddit.com/r/vibecoding/comments/1sm6rtj/gpt_really_looked_at_1000_lines_of_logic_and/ogefyf5/)
- **Model regression** Loss of control and model regressions can break previously working builds, leading to project abandonment. [source](https://reddit.com/r/vibecoding/comments/1pyc8t7/antigravity_nano_banana_might_be_the_ultimate/nwxg5m2/)
- **Model regressions** Loss of control or model regressions can break a previously working build, leading to project abandonment. [source](https://reddit.com/r/vibecoding/comments/1pyc8t7/antigravity_nano_banana_might_be_the_ultimate/nwxg5m2/)
- **Motivational burnout** Simple burnout or loss of motivation can cause people to abandon vibe-coded projects. [source](https://reddit.com/r/vibecoding/comments/1to52wh/how_is_vibecoding_even_a_thing/onyunfh/) [source](https://reddit.com/r/vibecoding/comments/1uusi2b/how_to_unvibe_code_a_vibe_coded_website/ox5z4fh/) [source](https://reddit.com/r/vibecoding/comments/1s61ww3/me_in_5_years/od17tpm/)
- **Motivational burnout** Some projects are abandoned due to simple burnout or loss of the 'vibe,' unrelated to code structuring. [source](https://reddit.com/r/vibecoding/comments/1to52wh/how_is_vibecoding_even_a_thing/onyunfh/) [source](https://reddit.com/r/vibecoding/comments/1uusi2b/how_to_unvibe_code_a_vibe_coded_website/ox5z4fh/) [source](https://reddit.com/r/vibecoding/comments/1s61ww3/me_in_5_years/od17tpm/)
- **Project resurrection** Some abandoned projects are eventually resurrected rather than completely discarded. [source](https://reddit.com/r/vibecoding/comments/1uy285i/i_took_my_defunct_first_vibe_coded_project_from/)
- **Project resurrection** Some vibe-coded projects are eventually resurrected rather than truly abandoned. [source](https://reddit.com/r/vibecoding/comments/1uy285i/i_took_my_defunct_first_vibe_coded_project_from/)
- **Technical debt** Accumulated technical debt leads to rewriting or abandoning AI-generated projects. [source](https://reddit.com/r/vibecoding/comments/1sugf1p/vibe_coding_killed_the_cant_build_excuse_so_whats/oi1hdzw/) [source](https://reddit.com/r/vibecoding/comments/1ufqime/is_aigenerated_code_creating_hidden_technical_debt/otu6f7a/) [source](https://reddit.com/r/vibecoding/comments/1sbi35n/the_real_cost_of_vibe_coding_isnt_the/oe4rp1n/)
- **Technical debt** Accumulated technical debt makes further changes riskier than starting over, leading to project abandonment or rewrites. [source](https://reddit.com/r/vibecoding/comments/1sugf1p/vibe_coding_killed_the_cant_build_excuse_so_whats/oi1hdzw/) [source](https://reddit.com/r/vibecoding/comments/1ufqime/is_aigenerated_code_creating_hidden_technical_debt/otu6f7a/) [source](https://reddit.com/r/vibecoding/comments/1sbi35n/the_real_cost_of_vibe_coding_isnt_the/oe4rp1n/)
- **Anthropic** Bill-shock is commonly experienced by users. [source](https://reddit.com/r/vibecoding/comments/1tqz6e2/anthropic_bill_came_in_this_morning_and_im/) [source](https://reddit.com/r/vibecoding/comments/1swxbyz/gotta_let_the_llms_focus_on_important_things/oijm7qz/) [source](https://reddit.com/r/vibecoding/comments/1u76m8k/guys_i_think_i_cracked_it/osafll5/)
- **Anthropic** Repricing has led to anger among users. [source](https://reddit.com/r/vibecoding/comments/1sbukly/anthropic_just_pulled_the_plug_on_thirdparty/oe6jru5/) [source](https://reddit.com/r/vibecoding/comments/1sy1o2e/pack_up_boyos_it_is_over/oirxijo/)
- **API token use** API token expense can quickly get out of hand. [source](https://reddit.com/r/vibecoding/comments/1mw66ja/most_tools_like_cursor_are_to_expensive/n9vdlrx/)
- **API token use** Cost and usage can spiral out of control quickly if not monitored. [source](https://reddit.com/r/vibecoding/comments/1mw66ja/most_tools_like_cursor_are_to_expensive/n9vdlrx/) [source](https://reddit.com/r/vibecoding/comments/1uk9shn/wtf_are_you_guys_doing_thats_burning_so_many/ouu7bik/)
- **Bill-shock** Users experience bill-shock from unexpected high charges on their AI tool usage. [source](https://reddit.com/r/vibecoding/comments/1tqz6e2/anthropic_bill_came_in_this_morning_and_im/) [source](https://reddit.com/r/vibecoding/comments/1swxbyz/gotta_let_the_llms_focus_on_important_things/oijm7qz/) [source](https://reddit.com/r/vibecoding/comments/1u76m8k/guys_i_think_i_cracked_it/osafll5/)
- **Community Sentiment** The community sees unexpected API costs as a rite of passage, with frequent discussions around coping strategies.
- **Cost-conscious behavior** High costs are causing users to shift towards cheaper AI models. [source](https://reddit.com/r/vibecoding/comments/1ts0b0i/the_price_difference_is_mad/) [source](https://reddit.com/r/vibecoding/comments/1vftsnj/presenting_deepcraft_a_oneshot_minecraft_clone/p1sszke/)
- **Cost-consciousness** Users are switching to cheaper models due to price differences. [source](https://reddit.com/r/vibecoding/comments/1ts0b0i/the_price_difference_is_mad/) [source](https://reddit.com/r/vibecoding/comments/1vftsnj/presenting_deepcraft_a_oneshot_minecraft_clone/p1sszke/)
- **Curiosity/Anxiety Loop** People frequently check and discuss their token spend due to curiosity and underlying anxiety. [source](https://reddit.com/r/vibecoding/comments/1v1qdak/how_many_ai_tokens_have_you_burned_building_your/oyq0xw6/)
- **Flat-rate plans** A $100 max account can consume the equivalent of several thousand dollars monthly if billed by token. [source](https://reddit.com/r/vibecoding/comments/1uk9shn/wtf_are_you_guys_doing_thats_burning_so_many/ouu7bik/)
- **Heavy users** Some heavy users find high token spend justifiable, while others see it as unsustainable. [source](https://reddit.com/r/vibecoding/comments/1ubur7e/alternative_to_claude_code/osyxcmo/) [source](https://reddit.com/r/vibecoding/comments/1rp2177/magic_of_vibe_coding_most_still_do_not_get_it/o9pbtez/) [source](https://reddit.com/r/vibecoding/comments/1se9854/opus_has_fallen_what_now/oeo6h1e/)
- **Heavy users** Spend a lot but rationalize it as cost-effective for the work done. [source](https://reddit.com/r/vibecoding/comments/1ubur7e/alternative_to_claude_code/osyxcmo/) [source](https://reddit.com/r/vibecoding/comments/1rp2177/magic_of_vibe_coding_most_still_do_not_get_it/o9pbtez/) [source](https://reddit.com/r/vibecoding/comments/1se9854/opus_has_fallen_what_now/oeo6h1e/)
- **Monetization Culture** Money is one of the sub's biggest recurring pain points. [source](https://reddit.com/r/vibecoding/comments/1siiokj/)
- **Monetization Culture** The gap between subscription price and real usage cost is a significant pain point in the community. [source](https://reddit.com/r/vibecoding/comments/1siiokj/)
- **Repricing Effects** Repricing by providers leads to anger and complaints about rising costs. [source](https://reddit.com/r/vibecoding/comments/1sbukly/anthropic_just_pulled_the_plug_on_thirdparty/oe6jru5/) [source](https://reddit.com/r/vibecoding/comments/1sy1o2e/pack_up_boyos_it_is_over/oirxijo/)
- **Usage-checking anxiety** People are often curious or worried about their token use. [source](https://reddit.com/r/vibecoding/comments/1rwrxtq/who_is_that/ob37bl7/) [source](https://reddit.com/r/vibecoding/comments/1v1qdak/how_many_ai_tokens_have_you_burned_building_your/oyq0xw6/)
- **Configuration Drift** Env/config drift and edge cases only surfaced with real traffic lead to diverse system behaviors and failures. [source](https://reddit.com/r/vibecoding/comments/1tqyz3c/our_mvp_was_fine_in_dev_then_production_turned/)
- **Data access/auth policies** Row-level security and permission issues cause problems once multiple user accounts are implemented. [source](https://reddit.com/r/vibecoding/comments/1s53qbj/am_i_cooked_for_using_gemini_3_flash_for_my/ocrvxan/)
- **Downtime repercussions** App outages result in significant financial losses and reputation damage. [source](https://reddit.com/r/vibecoding/comments/1rkzvcq/how_much_does_an_outage_really_cost_you/o8ooqpn/) [source](https://reddit.com/r/vibecoding/comments/1sg1lyz/heres_an_honest_vibe_coder_problem_nobody_talks/of1yqld/)
- **General self-diagnosis** Issues are often only discovered in production environments, highlighting differences from development contexts. [source](https://reddit.com/r/vibecoding/comments/1mv2yt2/i_vibe_coded_a_whole_ass_presentation_generator/n9p6n9v/) [source](https://reddit.com/r/vibecoding/comments/1u514ks/i_now_understand_the_hate/ori3v4f/)
- **Infrastructure Costs** Applications without proper rate limits or quotas experience runaway API or infrastructure bills. [source](https://reddit.com/r/vibecoding/comments/1ssc8n0/went_to_bed_with_a_10_budget_alert_woke_up_to/ohslwf4/) [source](https://reddit.com/r/vibecoding/comments/1th9tr4/ive_been_looking_at_a_bunch_of_vibecoded_apps_5/ommmco4/) [source](https://reddit.com/r/vibecoding/comments/1tfvv6z/make_sure_to_audit_your_users_ai_usage_before/omco2je/)
- **Load scaling failures** Vibe-coded apps often face operational issues under concurrent user load. [source](https://reddit.com/r/vibecoding/comments/1s52ap5/my_app_crashes_at_just_100_users_do_i_need_to/) [source](https://reddit.com/r/vibecoding/comments/1rw34jn/vibe_coding_feels_great_until_you_actually_run/ob5507y/) [source](https://reddit.com/r/vibecoding/comments/1szqjbd/what_do_you_struggle_with_getting_tested/oj3mmeh/)
- **Payment/Billing Issues** Stripe webhook bugs cause payment and billing processes to fail silently in some user cases. [source](https://reddit.com/r/vibecoding/comments/1vmhlzq/those_who_launched_a_vibecoded_product_what_broke/) [source](https://reddit.com/r/vibecoding/comments/1unqbn1/auditing_silent_billing_leaks_in_aibuilt_nextjs/) [source](https://reddit.com/r/vibecoding/comments/1spd6wm/what_security_essentials_should_i_keep_in_mind/oh82t7p/)
- **Scalability Issues** Concurrency and scale issues occur when apps built and validated against a single user fail under multiple users. [source](https://reddit.com/r/vibecoding/comments/1m7xv7s/i_have_vibe_coded_an_application_that_my_company/n4vy2k5/) [source](https://reddit.com/r/vibecoding/comments/1s44gbw/paying_for_errors_feels_like_im_being_robbed/ocqlx1r/) [source](https://reddit.com/r/vibecoding/comments/1rqi3k2/still_loyal_to_replit_or_alternatives/o9tpt0u/)
- **Security holes** Exposed API keys in client-side code allow unauthorized access and can lead to unexpected expenses. [source](https://reddit.com/r/vibecoding/comments/1q12ceq/found_a_hardcoded_openai_key_in_a_vibecoded_app/) [source](https://reddit.com/r/vibecoding/comments/1vow04e/vibe_code_is_secure_right/) [source](https://reddit.com/r/vibecoding/comments/1u8t602/vibe_code_problems/)
- **Security Vulnerabilities** Security holes arise in apps where databases and credentials are exposed due to improper deployment practices. [source](https://reddit.com/r/vibecoding/comments/1rix0v2/this_weekend_a_vibe_coded_app_got_exposed_on_x/) [source](https://reddit.com/r/vibecoding/comments/1sjeitv/built_a_vibe_coded_app_ill_try_to_break_it_for/ofwjaqw/)
- **Unexpected costs** Hosting and scaling costs can soar unexpectedly, threatening the viability of the app. [source](https://reddit.com/r/vibecoding/comments/1t1qyqf/im_a_senior_software_engineer_with_15_years/ojj078n/) [source](https://reddit.com/r/vibecoding/comments/1q5eylv/built_almost_everything_on_lovable_cloud_now/) [source](https://reddit.com/r/vibecoding/comments/1u3mggs/ongoing_costs_to_run_an_app_in_app_store/or6d740/)
