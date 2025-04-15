"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Question {
  question: string;
  answers: string[];
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [viewState, setViewState] = useState<"start" | "quiz" | "end">("start");
  const [opacity, setOpacity] = useState(1);
  const transitionDuration = 1000;
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [killerResult, setKillerResult] = useState<{
    name: string;
    description: string;
    reason: string;
  } | null>(null);
  const [killerImageUrl, setKillerImageUrl] = useState<string | null>(null);

  // 1) Add a new function to fetch the killer pick from our API route:
  async function fetchKillerPick(userAnswers: { question: string; answer: string }[]) {
    try {
      const res = await fetch("/api/getKillerPick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      return data; // Expect { name, description, reason }
    } catch (error) {
      console.error("Error fetching killer pick:", error);
      return null;
    }
  }

  useEffect(() => {
    if (viewState === "end") {
      fetchKillerPick(answers).then((res) => {
        if (res) {
          setKillerResult(res);
        }
      });
    }
  }, [viewState]);

  useEffect(() => {
    if (killerResult?.name) {
      fetch(`/api/getKillerImage?query=${encodeURIComponent(killerResult.name)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // In your existing code, after you get `data.link` from Google:
          if (data.link) {
            // Create a proxied URL for your client to load
            const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(data.link)}`;
            setKillerImageUrl(proxiedUrl);
          } else {
            console.warn("No image link found in response");
          }

        })
        .catch((error) => console.error("Error fetching killer image:", error));
    }
  }, [killerResult]);

  const shareOnTwitter = () => {
    if (!killerResult) return;
    const shareText = `My inner killer is ${killerResult.name}! Reason: ${killerResult.reason}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!killerResult) return;
    const shareText = `My inner killer is ${killerResult.name}! Reason: ${killerResult.reason}`;
    // Use the WhatsApp API URL; note that on desktop this typically opens WhatsApp Web.
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareUsingNativeAPI = async () => {
    // Use the native share API if available (works well on mobile)
    if (!killerResult) return;
    const shareText = `My inner killer is ${killerResult.name}! Reason: ${killerResult.reason}`;
    try {
      await navigator.share({
        title: "My Inner Killer",
        text: shareText,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const shareOnInstagram = () => {
    if (typeof navigator.share === "function") {
      shareUsingNativeAPI();
    } else {
      alert("Instagram sharing is not supported on this device. Please copy your result and share manually.");
    }
  };
  
  const shareOnSnapchat = () => {
    if (typeof navigator.share === "function") {
      shareUsingNativeAPI();
    } else {
      alert("Snapchat sharing is not supported on this device. Please copy your result and share manually.");
    }
  };
  



  // Example question array (add up to 20 here).
  const questions: Question[] = [
    {
      question: "1. WHAT'S YOUR IDEAL WAY OF SPENDING A DAY OFF?",
      answers: [
        "SPENDING QUALITY TIME WITH LOVED ONES.",
        "ALONE, WATCHING A MOVIE OR READING A BOOK.",
        "GOING OUT FOR SOME EXCITEMENT, MEETING NEW PEOPLE.",
        "GOING FOR A LONG WALK IN THE WOODS OR A QUIET PLACE.",
      ],
    },
    {
      question: "2. WHICH SEASON DO YOU FEEL MOST CONNECTED TO?",
      answers: [
        "SPRING - IT'S FULL OF LIFE AND NEW BEGINNINGS.",
        "WINTER - COLD, DARK AND INTROSPECTIVE.",
        "SUMMER - WARM, ENERGETIC AND VIBRANT.",
        "AUTUMN - QUIET, REFLECTIVE AND A BIT EERIE.",
      ],
    },
    {
      question: "3. HOW DO YOU USUALLY RESPOND TO STRESSFUL SITUATIONS?",
      answers: [
        "I STAY CALM AND COLLECTED.",
        "I GET ANGRY AND LASH OUT.",
        "I AVOID DEALING WITH IT AND WITHDRAW.",
        "I TRY MANIPULATE OTHERS TO GET OUT OF IT.",
      ],
    },
    {
      question: "4. WHICH OF THESE ANIMALS WOULD YOU MOST LIKELY ASSOCIATE YOURSELF WITH?",
      answers: [
        "WOLF.",
        "SNAKE.",
        "OWL.",
        "LION.",
      ],
    },
    {
      question: "5. WHAT WOULD BE YOUR IDEAL WEAPON OF CHOICE?",
      answers: [
        "WORDS AND PERSUASION, I DON'T DO VIOLENCE.",
        "A GUN, FOR EFFICIENCY AND PRECISION.",
        "SOMETHING QUICK AND PERSONAL, LIKE A KNIFE.",
        "I PREFER TO USE WHATEVER IS AROUND ME - IMPROVISED AND UNEXPECTED.",
      ],
    },
    {
      question: "6. WHICH OF THE FOLLOWING BEST DESCRIBES YOUR SOCIAL LIFE?",
      answers: [
        "I HAVE A CLOSE-KNIT GROUP OF FRIENDS AND FAMILY.",
        "I TEND TO ISOLATE MYSELF FROM OTHERS.",
        "I AM SURROUNDED BY PEOPLE, BUT THEY DON'T REALLY KNOW ME.",
        "I ENJOY MANIPULATING PEOPLE TO MAKE THEM THINK I'M THEIR FRIEND.",
      ],
    },
    {
      question: "7. HOW WOULD YOU DESCRIBE YOUR FASHION STYLE?",
      answers: [
        "CLASSIC AND NEAT, ALWAYS PUT-TOGETHER.",
        "DARK AND MYSTERIOUS, OFTEN WITH A TOUCH OF SEXINESS.",
        "COMFORTABLE AND PRATICAL, I DON'T CARE MUCH ABOUT FASHION.",
        "TRENDY AND ATTENTION-GRABBING.",
      ],
    },
    {
      question: "8. WHICH OF THE FOLLOWING BEST DESCRIBES YOUR IDEAL HOLIDAY?",
      answers: [
        "A QUIET GETAWAY IN THE MOUNTAINS, SURROUNDED BY NATURE.",
        "A REMOTE ISLAND WITH A BEACH, FAR FROM CIVILISATION.",
        "A BUSTLING CITY WITH A VIBRANT NIGHTLIFE.",
        "A LUXURIOUS RESORT WITH TOP-TIER SERVICE AND COMFORT.",
      ],
    },
    {
      question: "9. HOW DO YOU REACT WHEN SOMEONE CRITICISES YOU?",
      answers: [
        "I ACCEPT IT AND TRY TO LEARN FROM IT.",
        "I BECOME DEFENSIVE AND ARGUE.",
        "I IGNORE THE CRITICISM AND MOVE ON.",
        "I SECRETLY PLOT WAYS TO GET BACK AT THEM.",
      ],
    },
    {
      question: "10. WHAT TYPE OF MUSIC DO YOU LISTEN TO THE MOST?",
      answers: [
        "POP OR UPBEAT SONGS THAT MAKE ME FEEL GOOD.",
        "CLASSICAL OR AMBIENT MUSIC THAT HELPS ME THINK.",
        "ROCK OR ALTERNATIVE MUSIC TO MATCH MY ENERGY.",
        "RAP OR HIP-HOP WITH SHARP LYRICS AND HEAVY BEATS.",
      ],
    },
    {
      question: "11. IF YOU HAD TO CHOOSE AN OCCUPATION, WHAT WOULD IT BE?",
      answers: [
        "THERAPIST AND COUNSELOR, HELPING OTHERS WITH THEIR PROBLEMS.",
        "DETECTIVE OR INVESTIGATOR, SOLVING MYSTERIES.",
        "ARTIST OR MUSICIAN, EXPRESSING MYSELF THROUGH CREATVITY.",
        "BUSINESS OWNER OR ENTREPRENEUR, MAKING MONEY AT ALL COSTS.",
      ],
    },
    {
      question: "12. WHAT MOTIVATES YOU THE MOST IN LIFE?",
      answers: [
        "BUILDING STRONG RELATIONSHIPS AND EMOTIONAL CONNECTIONS.",
        "GAINING KNOWLEDGE AND UNDERSTANDING THE WORLD.",
        "ACHIEVING WEALTH, RECOGNITION AND SUCCESS.",
        "HAVING COMPLETE CONTROL OVER MY OWN ENVIRONMENT.",
      ],
    },
    {
      question: "13. WHICH TYPE OF MOVIE DO YOU ENJOY THE MOST?",
      answers: [
        "ROMANTIC COMEDIES, LIGHTHEARTED AND FUN.",
        "MYTHICAL OR FANTASY WITH MAGIC AND LEGENDARY CREATURES.",
        "ACTION-PACKED ADVENTURES OR SUPERHERO MOVIES.",
        "PSYCHOLOGICAL THRILLERS OR HORROR, WITH DEEP TWISTS AND JUMP SCARES.",
      ],
    },
    {
      question: "14. IF YOU HAD TO WEAR ONLY ONE COLOUR FOR A YEAR, WHAT WOULD IT BE?",
      answers: [
        "SOFT PASTELS - THEY FEEL LIGHT AND FRIENDLY.",
        "DARK BLUE OR GREY - COOL AND CALM.",
        "BRIGHT RED OR ORANGE - BOLD AND NOTICEABLE.",
        "BLACK OR WHITE - SLEEK AND VERSATILE.",
      ],
    },
    {
      question: "15. WHAT ROLE DO YOU MOST OFTEN TAKE IN A GROUP SETTING?",
      answers: [
        "THE PEACEMAKER, I MAKE SURE EVERYONE FEELS INCLUDED.",
        "THE THINKER, I OBSERVE BEFORE I SPEAK.",
        "THE LEADER, I TAKE CHARGE NATURALLY.",
        "THE OUTSIDER, I PARTICIPATE BUT ONLY ON MY TERMS.",
      ],
    },
    {
      question: "16. PICK A SCENT YOU'RE MOST DRAWN TO?",
      answers: [
        "FRESH LINEN OR CLEAN COTTON.",
        "OLD BOOKS OR ANTIQUE WOOD.",
        "SMOKE, GASOLINE OR WORN LEATHER.",
        "VANILLA, CARAMEL OR WARM SUGAR.",
      ],
    },
    {
      question: "17. WHICH OBJECT WOULD YOU CHOOSE TO KEEP WITH YOU AT ALL TIMES?",
      answers: [
        "A PHOTO OR ITEM THAT REMINDS ME OF SOMEONE I LOVE.",
        "A NOTEBOOK FOR IDEAS, THOUGHTS OR OBSERVATIONS.",
        "A SYMBOL OF POWER OR LUCK, LIKE A CHARM OR COIN.",
        "SOMETHING SHARP, COMPACT AND A LITTLE DANGEROUS.",
      ],
    },
    {
      question: "18. WHAT'S YOUR APPROACH TO KEEPING SECRETS?",
      answers: [
        "I ONLY KEEP SECRETS IF SOMEONE ASKS ME TO.",
        "I KEEP MOST THINGS TO MYSELF BY DEFAULT.",
        "I USE THEM CAREFULLY TO BUILD TRUST OR GAIN FAVOUR.",
        "I COLLECT THEM - THEY'RE MORE USEFUL THAN GOLD.",
      ],
    },
    {
      question: "19. WHICH INTERIOR SPACE FEELS MOST LIKE \"YOU\"?",
      answers: [
        "A BRIGHT COTTAGE WITH PLANTS, BOOKS AND HANDMADE DECOR.",
        "A GLASS-WALLED PENTHOUSE WITH SLEEK FURNITURE AND SMART TECH.",
        "A GRAFFITI-COVERED LOFT WITH SPEAKERS, BOLD COLOURS AND CLUTTER.",
        "A SEALED BASEMENT LINED WITH TOOLS, RELICS AND OLD FILES.",
      ],
    },
    {
      question: "20. WHAT TYPE OF DINNER WOULD YOU CHOOSE TO END YOUR EVENING?",
      answers: [
        "A LIGHT AND HEALTHY OPTION, LIKE GRILLED FISH AND STEAMED VEGETABLES.",
        "A COMFORTING CLASSIC, LIKE PASTA, STEAK OR ROAST CHICKEN.",
        "SOMETHING QUICK AND SIMPLE, LIKE A SANDWICH OR STIR-FRY.",
        "A RICH, INDULGENT MEAL, LIKE A GOURMET BURGER AND DECADENT DESSERT.",
      ],
    },
  ];

  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleStartClick = () => {
    try {
      const clickSound = new Audio("/button-click.mp3");
      clickSound.play().catch((error) =>
        console.error("Error playing click sound:", error)
      );
    } catch (error) {
      console.error("Error creating click sound Audio object:", error);
    }

    // Fade out the start screen
    setOpacity(0);

    setTimeout(() => {
      setViewState("quiz");
      // Play background music
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing background music:", error);
        });
      }
      // Fade in the quiz screen
      setOpacity(1);
    }, transitionDuration);
  };

  const handleAnswerClick = (answer: string) => {
    const currentQuestion = questions[questionIndex].question;
    // Play the paper sound effect on click
    const paperSound = new Audio("/paper.mp3");
    paperSound.play().catch((error) =>
      console.error("Error playing paper sound:", error)
    );

    console.log("SELECTED ANSWER:", answer);
    setAnswers((prev) => [...prev, { question: currentQuestion, answer }]);


    // Fade out current question
    setOpacity(0);

    setTimeout(() => {
      // Move to next question or end screen
      const nextIndex = questionIndex + 1;
      if (nextIndex < questions.length) {
        setQuestionIndex(nextIndex);
        requestAnimationFrame(() => setOpacity(1));
      } else {
        setViewState("end");
        requestAnimationFrame(() => setOpacity(1));
      }
    }, transitionDuration);
  };

  const renderQuizQuestion = () => {
    const current = questions[questionIndex];
    return (
      <main className="flex flex-col gap-6 sm:gap-8 items-center text-center w-full">
        <Image
          src="/magnify.png"
          alt="Blood drip"
          width={300}
          height={200}
          className={`
              absolute 
              top-23
              right-30
              z-0 
              opacity-65
              rotate-[-10deg] 

            `}
        />
        <Image
          src="/bloodsplat.png"
          alt="Blood drip"
          width={800}
          height={200}
          className={`
              absolute 
              top-70
              z-0 
              rotate-[-10deg] 

            `}
        />
        <h2 className="question-text text-xl sm:text-2xl lg:text-3xl px-4 uppercase z-1">
          {current.question}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full px-4">
          {current.answers.map((ans, i) => (
            <button
              key={i}
              onClick={() => handleAnswerClick(ans)}
              className="
                relative 
                flex 
                items-center 
                justify-center 
                h-100 
                bg-[url('/paper.png')] 
                bg-no-repeat 
                bg-center 
                text-base 
                sm:text-lg 
                hover:opacity-80 
                transition-opacity 
                duration-200 
                uppercase
                z-1
              "
              style={{ backgroundSize: "100%" }}
            >
              <div className="answer-text p-16">{ans}</div>
            </button>
          ))}
        </div>
      </main>
    );
  };

  const renderEndScreen = () => {
    if (!killerResult || !killerImageUrl) {
      // If we haven't gotten the response yet, show a loading or placeholder
      return (
        <main className="flex flex-col gap-6 sm:gap-8 items-center text-center w-full">
          <h2 className="text-3xl loading-text uppercase">Analyzing your results...</h2>
          <p className="text-xl desc-text uppercase">Please wait</p>
        </main>
      );
    }

    return (

      <main className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-center w-full">
        <div
          style={{ position: "fixed", top: "5rem", right: "6rem" }}
          className="z-50 flex gap-3"
        >
          <h2 className="text-4xl uppercase share-text pr-36 pt-4">SHARE</h2>

          <Image
            src="/arrow.png"
            alt="Arrow"
            width={100}
            height={100}
            className={`
              absolute 
              right-85 
              top-10 
              -translate-y-1/2 
              z-0 
            `}
          />
          <button onClick={shareOnInstagram} className="inline-block">
            <Image src="/instagram.png" alt="Share on Instagram" width={60} height={60} />
          </button>
          <button onClick={shareOnSnapchat} className="inline-block">
            <Image src="/snapchat.png" alt="Share on Snapchat" width={73} height={60} />
          </button>
          <button onClick={shareOnTwitter} className="inline-block">
            <Image src="/x.png" alt="Share on Twitter" width={60} height={60} />
          </button>
          <button onClick={shareOnWhatsApp} className="inline-block">
            <Image src="/whatsapp.png" alt="Share on WhatsApp" width={63} height={60} />
          </button>
        </div>
        <Image
          src="/bloodhand.png"
          alt="Bloody Handprint"
          width={250}
          height={200}
          className={`
              absolute 
              right-20 
              bottom-10 
              rotate-[0deg] 
              scale-x-[-1] 
              z-0 
            `}
        />

        <Image
          src="/bloodsplat.png"
          alt="Blood drip"
          width={500}
          height={200}
          className={`
              absolute 
              left-50 
              top-10 
              rotate-[0deg] 
              z-2 
            `}
        />

        {/* Left column: Image */}

        <div className="flex-[1] z-1">
          {killerImageUrl ? (
            <Image
              src={killerImageUrl}
              alt={killerResult?.name || "Killer Image"}
              width={330}
              height={400}
              // Since you're proxying from your own domain, no domain issues
              // But you might still want 'unoptimized' if you don't want any Next.js transformations
              unoptimized
            />
          ) : (
            <div>Loading killer image...</div>
          )}
        </div>

        {/* Right column: Text */}

        <div className="flex-[3] flex flex-col gap-4 text-left mt-20">
          <h2 className="text-3xl uppercase reason-text z-1">Your Inner Killer Is...</h2>
          <p className="text-2xl font-bold killer-text uppercase z-1">{killerResult.name}</p>
          <p className="text-l desc-text uppercase z-1">{killerResult.description}</p>
          <p className="text-l reason-text uppercase z-1">
            Reason: {killerResult.reason}
          </p>
        </div>
      </main>
    );

  };


  return (
    <div
      className="
        w-full 
        h-screen 
        overflow-hidden 
        bg-cover 
        bg-center 
        bg-no-repeat 
        grid 
        grid-rows-[20px_1fr_20px] 
        items-center 
        justify-items-center 
        p-8 
        pb-20 
        gap-16 
        sm:p-20 
        font-[family-name:var(--font-geist-sans)]
      "
      style={{ backgroundImage: "url('/chalk.jpeg')" }}
    >
      <audio ref={audioRef} src="/music.mp3" loop hidden />



      {/* Conditionally render images for 'start' state ONLY */}
      {viewState === "start" && (
        <>
          <Image
            src="/newspaper2.jpg"
            alt="Newspaper"
            width={600}
            height={600}
            className={`
              absolute 
              right-250 
              top-170 
              -translate-y-1/2 
              rotate-[20deg] 
              z-0 
              transition-opacity 
              ease-in-out 
              duration-1000 
              ${opacity === 1 ? "opacity-100" : "opacity-0"}
            `}
            priority
          />
          <Image
            src="/zodiac.jpg"
            alt="Zodiac"
            width={220}
            height={220}
            className={`
              absolute 
              right-5 
              top-35 
              -translate-y-1/2 
              rotate-[-10deg] 
              z-0 
              transition-opacity 
              ease-in-out 
              duration-1000 
              ${opacity === 1 ? "opacity-90" : "opacity-0"}
            `}
            priority
          />
          <Image
            src="/bloodsplat.png"
            alt="Blood Splat"
            width={500}
            height={500}
            className={`
              absolute 
              left-250 
              top-150 
              -translate-y-1/2 
              rotate-[30deg] 
              z-0 
              transition-opacity 
              ease-in-out 
              duration-1000 
              ${opacity === 1 ? "opacity-100" : "opacity-0"}
            `}
            priority
          />
          <Image
            src="/gun.png"
            alt="Gun"
            width={100}
            height={100}
            className={`
              absolute 
              left-320 
              top-100 
              -translate-y-1/2 
              rotate-[-50deg] 
              z-0 
              transition-opacity 
              ease-in-out 
              duration-1000 
              ${opacity === 1 ? "opacity-100" : "opacity-0"}
            `}
            priority
          />
          <Image
            src="/bloodhand.png"
            alt="Bloody Handprint"
            width={200}
            height={200}
            className={`
              absolute 
              left-20 
              top-40 
              -translate-y-1/2 
              rotate-[0deg] 
              z-0 
              transition-opacity 
              ease-in-out 
              duration-1000 
              ${opacity === 1 ? "opacity-70" : "opacity-0"}
            `}
            priority
          />
          <Image
            src="/chalk.png"
            alt="Chalk Outline"
            width={500}
            height={500}
            className={`
              absolute 
              left-250 
              top-150 
              -translate-y-1/2 
              rotate-[30deg] 
              z-0 
              transition-opacity 
              ease-in-out 
              duration-1000 
              ${opacity === 1 ? "opacity-50" : "opacity-0"}
            `}
            priority
          />
        </>
      )}

      {/* Main Content Area */}
      <div
        style={{ transitionDuration: `${transitionDuration}ms` }}
        className={`
          transition-opacity 
          ease-in-out 
          w-full 
          flex 
          justify-center 
          items-center 
          row-start-2 
          z-10 
          ${opacity === 1 ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* Render start screen / quiz question / end screen */}
        {viewState === "start" && (
          <main className="flex flex-col gap-[10px] items-center text-center">
            <h1 className="chalk-text uppercase">BEHIND THE SMILE</h1>
            <h1 className="chalk-subtext uppercase">WHO'S YOUR INNER KILLER?</h1>
            <button
              onClick={handleStartClick}
              className="
                mt-4 
                mx-auto 
                w-60 
                h-60 
                bg-cover 
                bg-center 
                rounded-lg 
                flex 
                items-center 
                justify-center 
                group 
                transition 
                duration-300
              "
              style={{ backgroundImage: "url('/postit2.png')" }}
            >
              <span
                className="
                  start-button 
                  text-black 
                  text-xl 
                  font-bold 
                  transition-colors 
                  duration-300 
                  group-hover:text-red-600 
                  uppercase
                "
              >
                START
              </span>
            </button>
          </main>
        )}

        {viewState === "quiz" && renderQuizQuestion()}

        {viewState === "end" && renderEndScreen()}
      </div>

    </div>
  );
}
