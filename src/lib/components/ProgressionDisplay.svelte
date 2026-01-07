<script lang="ts">
    interface Props {
        minutes?: number;
    }

    let { minutes = 0 }: Props = $props();

    let section1 = $derived(minutes >= 180);
    let section2 = $derived(minutes >= 600);
    let section3 = $derived(minutes >= 600);
    let section4 = $derived(minutes >= 900);
    let section5 = $derived(minutes >= 1800);
    let section6 = $derived(minutes >= 1800);
    let section7 = $derived(minutes >= 1800);
    let section8 = $derived(minutes >= 3600);
    let section9 = $derived(minutes >= 4000);

    let achieved1 = $derived(section1);
    let achieved2 = $derived((section2 && section3));
    let achieved3 = $derived(section4);
    let achieved4 = $derived((section5 && section6 && section7));
    let achieved5 = $derived(section8);


</script>

<div class="inline-block relative border border-(--bb-accent-dark)">
    <div class="absolute z-20 top-[1%] left-[1%] w-90 h-9">
        <svg class="absolute w-12 h-12 z-50" viewBox="0 0 24 24" fill={section1? "#D68D4B":"#fb2c36"}>
            <path d="M12 4l-1.41 1.41L16.17 11H-4v2h20.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
    </div>
    <img src="/progression.png" alt="Progression" class="block relative z-10" />
    <div class={section1 ? "absolute bg-[#D68D4B] z-0 top-[10%] left-[0%] w-90 h-9" : "absolute bg-red-500 z-0 top-[10%] left-[0%] w-90 h-9"}></div> <!-- Sect 1-->
    <div class={ section2 ? "absolute bg-[#D68D4B] z-0 top-[10%] left-[39%] w-101 h-9 " : "absolute bg-red-500 z-0 top-[10%] left-[39%] w-101 h-9 "}></div> <!-- Sect 2-->
    <div class={ section3 ? "absolute bg-[#D68D4B] z-0 top-[10.4%] left-[80.7%] w-8 h-55 " : "absolute bg-red-500 z-0 top-[10.4%] left-[80.7%] w-8 h-55 "}></div> <!-- Sect 3-->
    <div class={ section4 ? "absolute bg-[#D68D4B] z-0 top-[41%] left-[48%] w-75 h-11" : "absolute bg-red-500 z-0 top-[41%] left-[48%] w-75 h-11"}></div> <!-- Sect 4-->
    <div class={ section5 ? "absolute bg-[#D68D4B] z-0 top-[41.4%] left-[5%] w-98 h-10 " : "absolute bg-red-500 z-0 top-[41.4%] left-[5%] w-98 h-10 "}></div> <!-- Sect 5-->
    <div class={ section6 ? "absolute bg-[#D68D4B] z-0 top-[46%] left-[5.5%] w-10 h-31" : "absolute bg-red-500 z-0 top-[46%] left-[5.5%] w-10 h-31"}></div> <!-- Sect 6-->
    <div class={ section7 ? "absolute bg-[#D68D4B] z-0 top-[68%] left-[5.5%] w-50 h-10" : "absolute bg-red-500 z-0 top-[68%] left-[5.5%] w-50 h-10"}></div><!-- Sect 7-->
    <div class={ section8 ? "absolute bg-[#D68D4B] z-0 top-[67%] left-[27%] w-90 h-11" : "absolute bg-red-500 z-0 top-[67%] left-[27%] w-90 h-11"}></div><!-- Sect 8-->
    <div class={ section9 ? "absolute bg-[#D68D4B] z-0 top-[67%] left-[65.25%] w-84 h-11" : "absolute bg-red-500 z-0 top-[67%] left-[65.25%] w-84 h-11"}></div><!-- Sect 9-->
    <div class={ achieved1 ? "absolute bg-white z-20 top-[1%] left-[34%] w-50 h-35 rounded-full border-6 border-[#D68D4B]" : "absolute bg-white z-20 top-[1%] left-[34%] w-50 h-35 rounded-full border-2 border-red-500"}></div>
    <div class={achieved3 ? "absolute bg-[#0E1014] z-20 top-[32%] left-[32%] w-50 h-35 rounded-full border-6 border-[#D68D4B]" : "absolute bg-[#0E1014] z-20 top-[32%] left-[32%] w-50 h-35 rounded-full border-3 border-red-500"}></div>
    <div class={achieved2 ? "absolute bg-[#1B1D21] z-20 top-[32%] left-[72%] w-50 h-35 rounded-full border-4 border-[#D68D4B]" : "absolute bg-[#1B1D21] z-20 top-[32%] left-[72%] w-50 h-35 rounded-full border-3 border-red-500"}></div>
    <div class={achieved5 ? "absolute bg-[#F6F6EE] z-20 top-[58%] left-[60%] w-50 h-35 rounded-full border-9 border-[#ED702C]" : "absolute bg-[#F6F6EE] z-20 top-[58%] left-[60%] w-50 h-35 rounded-full border-3 border-red-500"}></div>
    <div class={achieved4 ? "absolute bg-[#858582] z-20 top-[58%] left-[20%] w-35 h-35 rounded-full border-5 border-[#D68D4B]" : "absolute bg-[#858582] z-20 top-[58%] left-[20%] w-35 h-35 rounded-full border-3 border-red-500"}></div>
    <img src="/newsletter.png" alt="Newsletter" class="absolute z-30 top-[3.5%] left-[38.5%] w-28" />
    <img src="/happenings.png" alt="Newsletter" class="absolute z-30 top-[35.4%] left-[74.9%] w-36" />
    <img src="/insta.png" alt="Instagram" class="absolute z-30 top-[35.4%] left-[35.4%] w-34" />
    <img src="/billboard_live.jpg" alt="Billboard" class="absolute z-30  rounded-md  drop-shadow-2xl top-[61.2%] left-[23.05%] w-20" />
    <img src="/hn.png" alt="Hacker News" class="absolute z-30  rounded-sm top-[63%] left-[61.6%] w-42" />
    <p class="text-xl absolute z-30 top-[0%] left-[10%] max-w-60 text-white">3 Hours - Buildboard Weekly Newsletter + Project Postcard</p>
    <p class="text-xl absolute z-30 top-[22%] left-[65%] max-w-30 text-white">10 Hours - #Happenings on Slack</p>
    <p class="text-xl absolute z-30 top-[25%] left-[14%] max-w-40 text-white">15 Hours - Story on the Hack Club Instagram</p>
    <p class="text-xl absolute z-30 top-[80%] left-[5%] max-w-50 text-white">30 Hours - Your very own billboard in New York City!</p>
    <p class="text-xl absolute z-30 top-[85%] left-[60%] text-white">60 Hours - Project Considered for a Promoted Hacker News Post</p>
    <p class="text-xl font-bold absolute z-30 top-[1%] right-[2%] text-white">You've logged {Math.round(100*minutes/60)/100} Hours :D</p>
</div>
