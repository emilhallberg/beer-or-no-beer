import Image from "next/image";

const characters = [
  { image: "/illustrations/hop-fox.webp", name: "Humleräven", theme: "mint" },
  {
    image: "/illustrations/foam-captain.webp",
    name: "Skumkaptenen",
    theme: "yellow",
  },
  {
    image: "/illustrations/malt-bear.webp",
    name: "Maltmonstret",
    theme: "pink",
  },
  {
    image: "/illustrations/hallmark-badger.webp",
    name: "Hällmarksguiden",
    theme: "forest",
  },
  {
    image: "/illustrations/classic-hare.webp",
    name: "Jazzharen",
    theme: "lavender",
  },
  {
    image: "/illustrations/breakfast-rooster.webp",
    name: "Frukosttuppen",
    theme: "peach",
  },
  {
    image: "/illustrations/rhino-suit.webp",
    name: "Kostymnoshörningen",
    theme: "ice",
  },
  {
    image: "/illustrations/deep-work.webp",
    name: "Djupdykaren",
    theme: "aqua",
  },
  {
    image: "/illustrations/birds-paradise.webp",
    name: "Paradisfågeln",
    theme: "guava",
  },
  {
    image: "/illustrations/holy-grail.webp",
    name: "Humleriddaren",
    theme: "grail",
  },
  {
    image: "/illustrations/night-frost.webp",
    name: "Nattugglan",
    theme: "frost",
  },
  {
    image: "/illustrations/cosmic-void.webp",
    name: "Kosmostvättbjörnen",
    theme: "cosmic",
  },
  {
    image: "/illustrations/leap-gate.webp",
    name: "Portalgrodan",
    theme: "portal",
  },
  {
    image: "/illustrations/el-cuatro.webp",
    name: "Trubaduren",
    theme: "terracotta",
  },
  {
    image: "/illustrations/hoppy-trail.webp",
    name: "Humlekängurun",
    theme: "trail",
  },
  {
    image: "/illustrations/dimma-lynx.webp",
    name: "Dimväktaren",
    theme: "mist",
  },
  {
    image: "/illustrations/juicy-mchopface.webp",
    name: "Humlefejan",
    theme: "citrus",
  },
  {
    image: "/illustrations/kelpie-horse.webp",
    name: "Vattenhästen",
    theme: "lagoon",
  },
  {
    image: "/illustrations/foehammer-boar.webp",
    name: "Humlesmeden",
    theme: "forge",
  },
  {
    image: "/illustrations/havsdjup-lobster.webp",
    name: "Djuphavshummern",
    theme: "deepsea",
  },
  {
    image: "/illustrations/lupomax-chameleon.webp",
    name: "Humleprofessorn",
    theme: "hoplab",
  },
  {
    image: "/illustrations/stenfyr-seal.webp",
    name: "Fyrsälen",
    theme: "harbor",
  },
  {
    image: "/illustrations/nattklang-bat.webp",
    name: "Nattspelaren",
    theme: "nocturne",
  },
  {
    image: "/illustrations/crocodile-lagoon.webp",
    name: "Lagunkrokodilen",
    theme: "bayou",
  },
] as const;

const nameIllustrations: Record<string, number> = {
  "hällmark ipa": 3,
  "classic pale ale": 4,
  "breakfast ipa": 5,
  "rhino suit": 6,
  "deep work": 7,
  "birds of paradise": 8,
  "the holy grail 2024": 9,
  "the holy grail": 9,
  "nattfrost porter": 10,
  "cosmic void": 11,
  "leap gate": 12,
  "el cuatro": 13,
  "hoppy trail": 14,
  dimma: 15,
  "juicy mchopface": 16,
  kelpie: 17,
  foehammer: 18,
  "havsdjup sour": 19,
  "x qdh lupomax citra x mosaic x azacca tipa": 20,
  stenfyr: 21,
  nattklang: 22,
  "crocodile glutenfri": 23,
};

export function getBeerCharacter(seed: number, beerName = "") {
  // Named artwork is decorative. The fallback pool includes every illustration
  // for both real and fake beers; artwork must never encode the answer.
  const index = nameIllustrations[beerName.trim().toLocaleLowerCase("sv-SE")];
  return characters[index ?? Math.abs(seed) % characters.length];
}

export default function BeerArt({
  seed = 0,
  beerName = "",
  priority = false,
  sizes = "(max-width: 639px) 340px, 440px",
}: {
  seed?: number;
  beerName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const character = getBeerCharacter(seed, beerName);
  return (
    <Image
      src={character.image}
      alt=""
      fill
      draggable={false}
      priority={priority}
      sizes={sizes}
      className={`character-art character-${character.theme}`}
    />
  );
}

export function CardFan() {
  return (
    <div className="card-fan" aria-hidden="true">
      {[1, 2, 0].map((seed) => {
        const character = getBeerCharacter(seed);
        return (
          <div
            key={seed}
            className={`fan-card fan-${seed} theme-${character.theme}`}
          >
            <div className="fan-card-heading">BEER?</div>
            <div className="fan-art">
              <BeerArt
                seed={seed}
                priority
                sizes="(max-width: 639px) 164px, 255px"
              />
            </div>
            <div className="fan-card-caption">
              <span>DE VANLIGA MISSTÄNKTA</span>
              <strong>{character.name}</strong>
              <span>★ ★ ★ ★ ★</span>
            </div>
          </div>
        );
      })}
      <span className="fan-sticker">
        Lita på
        <br />
        magkänslan!
      </span>
      <span className="fan-spark spark-one">✳</span>
      <span className="fan-spark spark-two">✦</span>
    </div>
  );
}
