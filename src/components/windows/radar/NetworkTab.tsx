import { useMemo, useState, type KeyboardEvent } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import {
  BACKER_KINDS,
  CITY_BY_ID,
  INSTITUTIONS,
  INSTITUTION_BY_ID,
  ITEM_BY_ID,
  RADAR_ITEMS,
  isNotPick,
  keyDate,
  standing,
  type Institution,
  type RadarItem,
} from '@/data/networkMock';
import { cx } from '@/lib/cx';
import styles from './NetworkTab.module.css';
import { isLive, whenLine } from '@/data/networkMock';

// ---- the graph --------------------------------------------------------------

type Tier = 0 | 1 | 2; // money, houses, programmes
type LinkKind = 'funds' | 'runs' | 'sponsors' | 'co';

interface GNode {
  id: string;
  tier: Tier;
  label: string;
  known: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  font: number;
  inst?: Institution;
  item?: RadarItem;
}
interface GLink {
  from: string;
  to: string;
  kind: LinkKind;
}

/** Programme node ids are prefixed so they never collide with an institution's. */
const pid = (item: RadarItem) => `p:${item.id}`;

const VB_W = 830;
const MONEY_RIGHT = 236; // money pills are right-aligned to this edge
const HOUSE_X = 430; // house pills are centred on this column
const PROG_X = 612; // programme dots
const ROW = 22;
const TOP = 26;

const textW = (s: string, font: number) => s.length * font * 0.56;
const trim = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/**
 * Order the two left columns so their links cross as little as possible:
 * a few rounds of the barycentre heuristic — each side sorted by the mean
 * position of what it is tied to on the other side.
 */
function orderColumns(money: Institution[], houses: Institution[], items: RadarItem[]) {
  let m = [...money];
  let h = [...houses].sort((a, b) => Number(b.known) - Number(a.known) || b.weight - a.weight);
  const mean = (xs: number[], fallback: number) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : fallback);
  for (let round = 0; round < 5; round++) {
    const hi = new Map(h.map((x, i) => [x.id, i / Math.max(1, h.length - 1)]));
    const mPos = new Map(
      m.map((x, i) => {
        const tied = [
          ...h.filter((house) => house.backers.includes(x.id)).map((house) => hi.get(house.id)!),
          ...items.filter((it) => it.sponsorIds.includes(x.id) && hi.has(it.orgId)).map((it) => hi.get(it.orgId)!),
        ];
        return [x.id, mean(tied, i / Math.max(1, m.length - 1))];
      }),
    );
    m = [...m].sort((a, b) => mPos.get(a.id)! - mPos.get(b.id)!);
    const mi = new Map(m.map((x, i) => [x.id, i / Math.max(1, m.length - 1)]));
    const hPos = new Map(
      h.map((x, i) => {
        const tied = x.backers.filter((id) => mi.has(id)).map((id) => mi.get(id)!);
        return [x.id, mean(tied, i / Math.max(1, h.length - 1))];
      }),
    );
    h = [...h].sort((a, b) => hPos.get(a.id)! - hPos.get(b.id)!);
  }
  return { money: m, houses: h };
}

function buildGraph() {
  const items = RADAR_ITEMS.filter(isLive);
  const isMoney = (i: Institution) => BACKER_KINDS.includes(i.kind);
  const { money, houses } = orderColumns(INSTITUTIONS.filter(isMoney), INSTITUTIONS.filter((i) => !isMoney(i)), items);

  const houseRank = new Map([...money, ...houses].map((x, i) => [x.id, i]));
  const progs = [...items].sort(
    (a, b) => houseRank.get(a.orgId)! - houseRank.get(b.orgId)! || keyDate(a).localeCompare(keyDate(b)),
  );

  const height = TOP * 2 + Math.max(progs.length, houses.length * 1.4, money.length * 2) * ROW;
  const spread = (i: number, n: number) => TOP + ((i + 0.5) / n) * (height - TOP * 2);

  const nodes: GNode[] = [];
  money.forEach((inst, i) => {
    const font = 11 + inst.weight * 0.3;
    const w = textW(inst.name, font) + 20;
    nodes.push({ id: inst.id, tier: 0, label: inst.name, known: inst.known, x: MONEY_RIGHT - w / 2, y: spread(i, money.length), w, h: font + 13, font, inst });
  });
  houses.forEach((inst, i) => {
    const font = 10.5 + inst.weight * 0.35;
    const w = textW(inst.name, font) + 20;
    nodes.push({ id: inst.id, tier: 1, label: inst.name, known: inst.known, x: HOUSE_X, y: spread(i, houses.length), w, h: font + 12, font, inst });
  });
  progs.forEach((item, i) => {
    nodes.push({ id: pid(item), tier: 2, label: trim(item.title, 30), known: isNotPick(item), x: PROG_X, y: spread(i, progs.length), w: 10, h: 10, font: 11.5, item });
  });

  const links: GLink[] = [];
  INSTITUTIONS.forEach((inst) => inst.backers.forEach((b) => links.push({ from: b, to: inst.id, kind: 'funds' })));
  const pairs = new Set<string>();
  progs.forEach((item) => {
    links.push({ from: item.orgId, to: pid(item), kind: 'runs' });
    item.coOrgIds.forEach((co) => {
      links.push({ from: co, to: pid(item), kind: 'runs' });
      const key = [item.orgId, co].sort().join('|');
      if (!pairs.has(key)) {
        pairs.add(key);
        links.push({ from: item.orgId, to: co, kind: 'co' });
      }
    });
    item.sponsorIds.forEach((s) => links.push({ from: s, to: pid(item), kind: 'sponsors' }));
  });

  return { nodes, links, height, byId: new Map(nodes.map((n) => [n.id, n])) };
}

const GRAPH = buildGraph();

/** Everything a node hangs from, everything that hangs from it, and who it works with. */
function chainOf(id: string): Set<string> {
  const out = new Set([id]);
  const walk = (start: string, dir: 'up' | 'down') => {
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop()!;
      GRAPH.links.forEach((l) => {
        if (l.kind === 'co') return;
        const next = dir === 'down' ? (l.from === cur ? l.to : null) : l.to === cur ? l.from : null;
        if (next && !out.has(next)) {
          out.add(next);
          stack.push(next);
        }
      });
    }
  };
  walk(id, 'up');
  walk(id, 'down');
  GRAPH.links.forEach((l) => {
    if (l.kind !== 'co') return;
    if (l.from === id) out.add(l.to);
    if (l.to === id) out.add(l.from);
  });
  return out;
}

/** Programmes a node reaches downstream — how far a backer's money travels. */
const reachOf = (id: string) => [...chainOf(id)].filter((n) => n.startsWith('p:')).map((n) => ITEM_BY_ID[n.slice(2)]);

// ---- geometry ---------------------------------------------------------------

const leftEdge = (n: GNode) => n.x - n.w / 2;
const rightEdge = (n: GNode) => n.x + n.w / 2;

function linkPath(l: GLink): string | null {
  const a = GRAPH.byId.get(l.from);
  const b = GRAPH.byId.get(l.to);
  if (!a || !b) return null;
  // Same column: an arc out to the left, deeper the further apart the two are.
  if (a.tier === b.tier) {
    const x1 = leftEdge(a);
    const x2 = leftEdge(b);
    const k = 18 + Math.abs(b.y - a.y) * 0.22;
    return `M${x1} ${a.y} C${x1 - k} ${a.y} ${x2 - k} ${b.y} ${x2} ${b.y}`;
  }
  const x1 = rightEdge(a);
  const x2 = b.tier === 2 ? b.x - 5 : leftEdge(b);
  const mx = (x1 + x2) / 2;
  return `M${x1} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${x2} ${b.y}`;
}

// ---- the tab ----------------------------------------------------------------

/**
 * How the field is wired: who pays (left), the houses they pay for
 * (middle), what those houses put on (right). Vertical links are money —
 * a backer funding a house, or sponsoring one programme directly. The
 * pink arcs are the horizontal ones: houses that run something together.
 *
 * Point at anything to light its whole chain — every backer above it and
 * everything below it. The same sums drive "sort by standing" in the
 * gallery, so this is the working behind that sort, drawn out.
 */
export function NetworkTab() {
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = hover ?? selected;
  const lit = useMemo(() => (active ? chainOf(active) : null), [active]);

  const select = (id: string | null) => setSelected((s) => (s === id ? null : id));
  const onKey = (id: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(id);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h2 className={styles.title}>How the field is wired</h2>
        <p className={styles.sub}>
          Money on the left, the houses it pays for in the middle, what they put on at the right. Pink arcs are houses that run
          something together. Point at anything to follow its chain. The names here are made up for now: this shows how
          the field is wired, not who is wired to whom.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.graphWrap}>
          <div className={styles.columns} aria-hidden="true">
            <span style={{ right: `${100 - (MONEY_RIGHT / VB_W) * 100}%` }}>Who pays</span>
            <span style={{ left: `${(HOUSE_X / VB_W) * 100}%`, transform: 'translateX(-50%)' }}>Who runs it</span>
            <span style={{ left: `${((PROG_X - 6) / VB_W) * 100}%` }}>What is on</span>
          </div>
          <svg
            className={styles.graph}
            viewBox={`0 0 ${VB_W} ${GRAPH.height}`}
            role="group"
            aria-label="Network of backers, institutions and programmes"
            onMouseLeave={() => setHover(null)}
          >
            <g className={styles.links}>
              {GRAPH.links.map((l, i) => {
                const d = linkPath(l);
                if (!d) return null;
                const on = lit ? lit.has(l.from) && lit.has(l.to) : false;
                return <path key={i} d={d} className={cx(styles.link, styles[l.kind], on && styles.linkOn, lit && !on && styles.linkDim)} />;
              })}
            </g>

            {GRAPH.nodes.map((n) => {
              const on = lit?.has(n.id) ?? false;
              const dim = Boolean(lit) && !on;
              const label = n.item ? n.item.title : `${n.label}, ${n.inst?.kind}`;
              const common = {
                tabIndex: 0,
                role: 'button',
                'aria-label': `${label}${n.known ? ', NOT pick' : ''}`,
                'aria-pressed': selected === n.id,
                className: cx(styles.node, n.tier === 0 && styles.money, n.tier === 1 && styles.house, n.known && styles.known, on && styles.nodeOn, dim && styles.nodeDim, selected === n.id && styles.nodeSel),
                onMouseEnter: () => setHover(n.id),
                onFocus: () => setHover(n.id),
                onBlur: () => setHover(null),
                onClick: () => select(n.id),
                onKeyDown: onKey(n.id),
              };
              if (n.tier === 2 && n.item) {
                return (
                  <g key={n.id} {...common} className={cx(common.className, styles.prog, n.item.group === 'call' && styles.call)}>
                    <rect x={n.x - 8} y={n.y - ROW / 2} width={VB_W - n.x + 8} height={ROW} className={styles.hit} />
                    <circle cx={n.x} cy={n.y} r={5} className={styles.dot} />
                    <text x={n.x + 12} y={n.y + 4} fontSize={n.font} className={styles.progLabel}>
                      {n.label}
                    </text>
                  </g>
                );
              }
              return (
                <g key={n.id} {...common}>
                  <rect x={leftEdge(n)} y={n.y - n.h / 2} width={n.w} height={n.h} rx={n.h / 2} className={styles.pill} />
                  <text x={n.x} y={n.y + n.font * 0.36} fontSize={n.font} className={styles.pillLabel}>
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className={styles.panel}>{selected ? <Detail id={selected} onPick={select} /> : <Overview onPick={select} />}</aside>
      </div>
    </div>
  );
}

// ---- the side panel -----------------------------------------------------------

function Overview({ onPick }: { onPick: (id: string) => void }) {
  const money = GRAPH.nodes.filter((n) => n.tier === 0);
  const reach = money.map((n) => ({ n, count: reachOf(n.id).length })).sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...reach.map((r) => r.count));
  const progs = GRAPH.nodes.filter((n) => n.tier === 2);
  const picks = progs.filter((n) => n.known).length;
  const corporate = progs.filter((n) => [...chainOf(n.id)].some((id) => INSTITUTION_BY_ID[id]?.kind === 'brand')).length;

  return (
    <div className={styles.panelBody}>
      <h3 className={styles.panelTitle}>The field, in numbers</h3>
      <dl className={styles.facts}>
        <div>
          <dt>{progs.length}</dt>
          <dd>things on</dd>
        </div>
        <div>
          <dt>{picks}</dt>
          <dd>NOT picks</dd>
        </div>
        <div>
          <dt>{corporate}</dt>
          <dd>touch brand money</dd>
        </div>
      </dl>

      <h4 className={styles.panelLabel}>Whose money reaches furthest</h4>
      <ol className={styles.bars}>
        {reach.map(({ n, count }) => (
          <li key={n.id}>
            <button type="button" className={styles.bar} onClick={() => onPick(n.id)}>
              <span className={styles.barName}>
                {n.known && <span className={styles.pickDot} aria-label="NOT pick" />}
                {n.label}
              </span>
              <span className={styles.barTrack}>
                <span className={cx(styles.barFill, n.known && styles.barKnown)} style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className={styles.barCount}>{count}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.legend}>
        <span>
          <i className={styles.keyFunds} /> funds a house
        </span>
        <span>
          <i className={styles.keySponsors} /> sponsors one programme
        </span>
        <span>
          <i className={styles.keyCo} /> run something together
        </span>
        <span>
          <i className={styles.keyPick} /> NOT pick: one of ours
        </span>
      </div>
    </div>
  );
}

function Chips({ label, ids, onPick }: { label: string; ids: string[]; onPick: (id: string) => void }) {
  if (ids.length === 0) return null;
  return (
    <>
      <h4 className={styles.panelLabel}>{label}</h4>
      <div className={styles.chips}>
        {ids.map((id) => {
          const inst = INSTITUTION_BY_ID[id];
          if (!inst) return null;
          return (
            <button key={id} type="button" className={cx(styles.chip, inst.known && styles.chipKnown)} onClick={() => onPick(id)}>
              {inst.name}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Detail({ id, onPick }: { id: string; onPick: (id: string | null) => void }) {
  const node = GRAPH.byId.get(id);
  if (!node) return null;
  const back = (
    <button type="button" className={styles.back} onClick={() => onPick(id)}>
      <MaterialIcon name="arrow_back" size={14} />
      The whole field
    </button>
  );

  if (node.item) {
    const item = node.item;
    const org = INSTITUTION_BY_ID[item.orgId];
    const payers = [...new Set([...(org?.backers ?? []), ...item.sponsorIds])];
    return (
      <div className={styles.panelBody}>
        {back}
        <span className={styles.kind}>
          {item.type} · {CITY_BY_ID[item.cityId].name}
        </span>
        <h3 className={styles.detailTitle}>{item.title}</h3>
        {node.known && <Sticker text="NOT pick" color="lime" rotate={-4} className={styles.detailSticker} />}
        <p className={styles.blurb}>{item.blurb}</p>
        <p className={styles.when}>{whenLine(item)}</p>
        <Chips label="Run by" ids={[item.orgId, ...item.coOrgIds]} onPick={onPick} />
        <Chips label="Paid for by" ids={payers} onPick={onPick} />
        <p className={styles.standing}>
          Standing <b>{standing(item)}</b> — the organiser's weight counted twice, plus everyone paying. It is what "sort by
          standing" uses.
        </p>
        <a className={styles.open} href={item.url} target="_blank" rel="noreferrer">
          {item.group === 'call' ? 'Apply' : 'Open'}
          <MaterialIcon name="arrow_outward" size={14} />
        </a>
      </div>
    );
  }

  const inst = node.inst!;
  const funds = INSTITUTIONS.filter((i) => i.backers.includes(inst.id)).map((i) => i.id);
  const partners = GRAPH.links.filter((l) => l.kind === 'co' && (l.from === id || l.to === id)).map((l) => (l.from === id ? l.to : l.from));
  const own = GRAPH.nodes.filter((n) => n.item && (n.item.orgId === id || n.item.coOrgIds.includes(id))).map((n) => n.item!);
  const reach = reachOf(id);
  const cities = new Set(reach.map((i) => i.cityId)).size;

  return (
    <div className={styles.panelBody}>
      {back}
      <span className={styles.kind}>
        {inst.kind} · {CITY_BY_ID[inst.cityId].name}
      </span>
      <h3 className={styles.detailTitle}>{inst.name}</h3>
      {inst.known && <Sticker text="NOT pick" color="lime" rotate={-4} className={styles.detailSticker} />}
      <p className={styles.blurb}>{inst.blurb}</p>
      {node.tier === 0 && (
        <p className={styles.when}>
          Reaches {reach.length} programme{reach.length === 1 ? '' : 's'} in {cities} cit{cities === 1 ? 'y' : 'ies'}
        </p>
      )}
      <Chips label="Funded by" ids={inst.backers} onPick={onPick} />
      <Chips label="Funds" ids={funds} onPick={onPick} />
      <Chips label="Works with" ids={partners} onPick={onPick} />
      {own.length > 0 && (
        <>
          <h4 className={styles.panelLabel}>On now</h4>
          <ul className={styles.progList}>
            {own.map((item) => (
              <li key={item.id}>
                <button type="button" className={styles.progRow} onClick={() => onPick(pid(item))}>
                  <span className={cx(styles.progDot, item.group === 'call' && styles.progDotCall)} />
                  <span className={styles.progText}>
                    <span className={styles.progTitle}>{item.title}</span>
                    <span className={styles.progMeta}>{whenLine(item)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
