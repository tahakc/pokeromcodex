<script lang="ts">
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { HelpCircle } from 'lucide-svelte';
	import FaqHero from '$lib/components/faq/faq-hero.svelte';
	import { fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>FAQ - PokeRomCodex</title>
	<meta
		name="description"
		content="Frequently asked questions about Pokémon ROM hacks and PokeRomCodex"
	/>
</svelte:head>

<div in:fade={{ duration: 300 }}>
	<FaqHero />

	<div class="container mx-auto max-w-4xl py-10">
		<Separator class="mb-10" />

		<div class="grid gap-8">
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<Badge variant="outline" class="px-3 py-1">
						<HelpCircle class="mr-1 h-4 w-4" />
						<span>General</span>
					</Badge>
				</div>

				<Accordion class="w-full">
					<AccordionItem value="what-are-rom-hacks">
						<AccordionTrigger>What are Pokémon ROM hacks?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								Pokémon ROM hacks are fan-made modifications of official Pokémon games. 
								These creative projects can range from minor tweaks, like improved graphics 
								or adjusted Pokémon availability, to ambitious overhauls that introduce brand-new stories, 
								regions, and gameplay mechanics, offering a fresh and unique experience for players.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="legal-rom-hacks">
						<AccordionTrigger>Are ROM hacks legal?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								Yes! Making and distributing ROM Hacks doesn't violate any copyright laws, 
								as long as you aren't distributing copyrighted content or making money off of 
								copyrighted content. Because distributing copyrighted content is still illegal, 
								creators bundle their changes into 'patches' which players can apply to their 
								own dumped backups of legitimate, official games. This is why PokeROM Codex 
								only distributes these patches; it is up to the players to provide their 
								own legally dumped copies of the games.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="no-download-prepatched-roms">
						<AccordionTrigger>Why shouldn't I download a pre-patched ROM?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								Downloading prepatched ROMs disrespects creators, as these files are often 
								hosted without permission and can misrepresent their work while generating ad 
								revenue for unrelated parties. They also come with risks, such as outdated versions, 
								missing features, improper patching, or even security vulnerabilities. Moreover, 
								distributing prepatched ROMs violates copyright laws, jeopardizing the legal gray 
								area that allows ROMhacks to exist. By patching the game yourself, you ensure 
								accuracy, support creators, and help protect the broader community from potential 
								legal scrutiny.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="play-rom-hacks">
						<AccordionTrigger>How do I play ROM hacks?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">To play ROM hacks, you'll need:</p>
							<ol class="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
								<li>A ROM of the original game (which you should legally own)</li>
								<li>The ROM hack patch file (usually .ips or .ups format)</li>
								<li>A patching tool like Lunar IPS or NUPS</li>
								<li>An emulator compatible with the game console</li>
							</ol>
							<p class="mt-2 text-muted-foreground">
								Apply the patch to your ROM using the patching tool, then open the patched ROM with
								your emulator.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<Badge variant="outline" class="px-3 py-1">
						<HelpCircle class="mr-1 h-4 w-4" />
						<span>Using PokeRomCodex</span>
					</Badge>
				</div>

				<Accordion class="w-full">
					<AccordionItem value="what-is-pokeromcodex">
						<AccordionTrigger>What is PokeRomCodex?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								PokeRomCodex is a comprehensive database of Pokémon ROM hacks. Our goal is to help
								players discover and learn about high-quality ROM hacks by providing detailed
								information about features, difficulty levels, and completion status. We do not host
								or distribute any ROM files.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="suggest-rom-hack">
						<AccordionTrigger>How can I suggest a ROM hack to be added?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								We welcome suggestions for new ROM hacks to add to our database! Please use the
								contact form on our website or reach out through our Discord community. When
								suggesting a ROM hack, please provide as much information as possible, including the
								hack's name, creator, base game, and a link to the official release page.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="filter-search">
						<AccordionTrigger>How do I find ROM hacks that match my preferences?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								PokeRomCodex offers powerful search and filtering options to help you find ROM hacks
								that match your preferences. You can filter by:
							</p>
							<ul class="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
								<li>Difficulty level (Easy, Normal, Hard, etc.)</li>
								<li>Features (New Region, Physical/Special Split, etc.)</li>
								<li>Completion status (Complete, Beta, etc.)</li>
								<li>Base game (FireRed, Emerald, etc.)</li>
							</ul>
							<p class="mt-2 text-muted-foreground">
								You can also use the search bar to find ROM hacks by title, creator, or base game.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<Badge variant="outline" class="px-3 py-1">
						<HelpCircle class="mr-1 h-4 w-4" />
						<span>Technical</span>
					</Badge>
				</div>

				<Accordion class="w-full">
					<AccordionItem value="recommended-emulators">
						<AccordionTrigger>What emulators do you recommend?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								Here are some popular emulators for different platforms:
							</p>
							<ul class="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
								<li><strong>Game Boy/GBC/GBA:</strong> mGBA, Visual Boy Advance</li>
								<li><strong>Nintendo DS:</strong> DeSmuME, melonDS</li>
								<li><strong>Mobile:</strong> My Boy! (Android), Delta (iOS)</li>
							</ul>
							<p class="mt-2 text-muted-foreground">
								Always download emulators from their official websites to avoid malware.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="save-files">
						<AccordionTrigger
							>Can I transfer my save file between different ROM hacks?</AccordionTrigger
						>
						<AccordionContent>
							<p class="text-muted-foreground">
								Generally, save files are not compatible between different ROM hacks, even if
								they're based on the same original game. Each ROM hack may have different internal
								structures that make save files incompatible. It's best to start a new save file for
								each ROM hack you play.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="troubleshooting">
						<AccordionTrigger>My ROM hack isn't working. What should I do?</AccordionTrigger>
						<AccordionContent>
							<p class="text-muted-foreground">
								If you're having trouble with a ROM hack, try these troubleshooting steps:
							</p>
							<ol class="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
								<li>Verify you're using the correct base ROM version</li>
								<li>Make sure you're using the latest version of the patch</li>
								<li>Try a different patching tool</li>
								<li>Check if your emulator is compatible with the hack</li>
								<li>Look for specific instructions from the hack's creator</li>
							</ol>
							<p class="mt-2 text-muted-foreground">
								Many ROM hack creators have Discord servers or forums where you can get help with
								specific issues.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>

		<div class="mt-16 space-y-4 text-center">
			<h2 class="text-2xl font-bold">Still have questions?</h2>
			<p class="text-muted-foreground">
				Join our community on Discord or check out the r/PokemonROMhacks subreddit for more help.
			</p>
			<div class="mt-4 flex justify-center gap-4">
                <a
                    href="https://discord.gg/XBcwTDWCHQ"
                    target="_blank"
                    class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    Join Discord
                </a>
                <a
                    href="https://www.reddit.com/r/PokemonROMhacks/"
                    target="_blank"
                    class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                    Visit Subreddit
                </a>
            </div>
		</div>
	</div>
</div>
