"use client";

import { useEffect, useRef, useState } from "react";
import { challengeById } from "@/data/challenges";
import { investorLine } from "@/data/people";
import {
  cardLines,
  changeDots,
  requestFor,
  usersDots,
  type ShopGroup,
  type Upgrade,
  type UsersSize,
} from "@/data/upgrades";
import { SenderBadge, TickIcon } from "@/components/desktop/gameIcons";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { fullNumber } from "@/components/desktop/format";
import { scrollWithin } from "@/components/desktop/scrollWithin";
import { ShopIcon } from "@/components/desktop/shopIcons";
import { useGameContext } from "@/components/useGame";
import { canBuy, canBuyLifeline, itemsOnShow, lifelinePrice, neededNext } from "@/game/rules";
import { MayaSays } from "./Incident";

// The Shop, in three tabs (docs/UPGRADES.md > Shop layout, and docs/UI_THEME.md > Shop cards).

type Tab = "features" | "servers" | "setup";

const tabs: { id: Tab; name: string; groups: ShopGroup[] }[] = [
  // Must-have features first, then nice-to-have features.
  { id: "features", name: "Features", groups: ["must", "nice"] },
  { id: "servers", name: "Servers", groups: ["server"] },
  { id: "setup", name: "Your setup", groups: ["setup"] },
];

const tabOf = (group: ShopGroup): Tab => tabs.find((t) => t.groups.includes(group))!.id;

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";
const card = "flex flex-col gap-2 rounded-lg border-2 bg-white px-4 py-3";

export default function Shop() {
  const { state, dispatch } = useGameContext();
  const { shopFocus } = useDesktop();
  const [tab, setTab] = useState<Tab>("features");
  // Maya's investor line shows after a top-up, until the Shop is closed.
  const [investor, setInvestor] = useState(false);
  const focusRef = useRef<HTMLLIElement>(null);

  // "Open in Shop" switches to the item's tab and scrolls to its card.
  const focusId = shopFocus?.id;
  useEffect(() => {
    const item = itemsOnShow(state).find((u) => u.id === focusId);
    if (item) setTab(tabOf(item.group));
    // Only when a new "Open in Shop" arrives, never when the state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, shopFocus?.n]);
  useEffect(() => scrollWithin(focusRef.current), [tab, shopFocus?.n]);

  const groups = tabs.find((t) => t.id === tab)!.groups;
  const items = itemsOnShow(state)
    .filter((u) => groups.includes(u.group))
    .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group));

  const buy = (item: Upgrade) => {
    if (state.cash < item.price && neededNext(state) === item.id) setInvestor(true);
    dispatch({ type: "buy", itemId: item.id });
  };

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Shop" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-12 rounded-md border-2 border-ink px-4 text-[18px] ${
              tab === t.id ? "bg-[#FFE08A] font-bold" : "bg-white hover:bg-[#EEF3FD]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {investor && <MayaSays>{investorLine}</MayaSays>}

      <ul className="flex flex-col gap-3">
        {tab === "setup" && <LifelineCard />}
        {items.map((item) => (
          <li key={item.id} ref={item.id === focusId ? focusRef : undefined}>
            <ItemCard item={item} focused={item.id === focusId} onBuy={() => buy(item)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemCard({ item, focused, onBuy }: { item: Upgrade; focused: boolean; onBuy: () => void }) {
  const { state } = useGameContext();
  const owned = state.owned.includes(item.id);
  const needed = neededNext(state) === item.id;
  const affordable = canBuy(state, item.id);
  const asker = requestFor(item.id)?.from;

  // The one line saying what it does (docs/UPGRADES.md > Shop layout).
  const line =
    item.effect ??
    (item.unlocks ? `${cardLines.unlocks} ${challengeById(item.unlocks)?.title ?? item.unlocks}` : cardLines.nice);

  return (
    <article className={`${card} ${focused ? "border-[#F2B632] ring-4 ring-[#FFE08A]" : "border-bar"}`}>
      <Header name={item.name} icon={item.id} price={item.price} grey={!owned && !affordable} />
      {needed && !owned && (
        <span className="self-start rounded-full bg-alert px-3 py-0.5 text-[18px] font-bold text-white">Needed next</span>
      )}
      <Dots label="Change" word={item.change} filled={changeDots[item.change]} />
      <Dots label="Users" word={item.users} filled={usersDots[item.users as UsersSize]} />
      <p className="text-[18px] font-bold">{item.usersGained > 0 ? `+${fullNumber(item.usersGained)} users` : "No new users"}</p>
      <p className="text-[18px]">{line}</p>
      {asker && (
        <p className="flex items-center gap-2 text-[18px]">
          <SenderBadge from={asker} />
        </p>
      )}
      <BuyRow owned={owned} affordable={affordable} onBuy={onBuy} />
    </article>
  );
}

// Victor's lifeline: first on the Your setup tab, with the price for the current stage and no dots
// (docs/UPGRADES.md > Shop layout, and > Victor's lifeline).
function LifelineCard() {
  const { state, dispatch } = useGameContext();
  const price = lifelinePrice(state);
  const held = state.lifeline !== null;
  const affordable = canBuyLifeline(state);
  return (
    <li>
      <article className={`${card} border-[#4A4A4A]`}>
        <Header name="Victor's lifeline" icon="lifeline" price={price} grey={!held && !affordable} />
        <p className="text-[18px]">{cardLines.lifeline}</p>
        <p className="flex items-center gap-2 text-[18px]">
          <SenderBadge from="victor" />
        </p>
        {held ? (
          <p className="flex items-center gap-2 text-[18px] font-bold">
            <TickIcon />
            Held
          </p>
        ) : (
          <BuyRow owned={false} affordable={affordable} onBuy={() => dispatch({ type: "buyLifeline" })} />
        )}
      </article>
    </li>
  );
}

function Header({ name, icon, price, grey }: { name: string; icon: string; price: number; grey: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <ShopIcon id={icon} />
      <h3 className="min-w-0 flex-1 text-[20px] font-bold leading-snug">{name}</h3>
      <span className={`text-[24px] font-bold leading-snug ${grey ? "text-[#5A5A5A]" : ""}`}>£{fullNumber(price)}</span>
    </div>
  );
}

// A row of three dots, with its word beside it (docs/UI_THEME.md > Shop cards).
function Dots({ label, word, filled }: { label: string; word: string; filled: number }) {
  return (
    <p className="flex items-center gap-2 text-[18px]">
      <span className="w-[4.5em] font-bold">{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-4 w-4 rounded-full border-2 border-ink ${n <= filled ? "bg-ink" : "bg-white"}`} />
        ))}
      </span>
      <span>{word}</span>
    </p>
  );
}

function BuyRow({ owned, affordable, onBuy }: { owned: boolean; affordable: boolean; onBuy: () => void }) {
  if (owned) {
    return (
      <p className="flex items-center gap-2 text-[18px] font-bold">
        <TickIcon />
        Owned
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={!affordable}
        onClick={onBuy}
        className={`${button} ${affordable ? "bg-[#FFE08A] hover:bg-[#FFD35C]" : "border-[#8A8A8A] bg-[#DDDAD0] text-[#4A4A4A]"}`}
      >
        Buy
      </button>
      {!affordable && <span className="text-[18px] text-[#4A4A4A]">Not enough cash</span>}
    </div>
  );
}
