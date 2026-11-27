"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, GaugeIcon, PencilIcon, PlusIcon, XIcon } from "@/components/ui/icons";
import { inputClasses, months, onlyDigits, pastYears } from "@/lib/formUtils";
import { MAX_SCORE, MIN_SCORE, isValidScore, monthIndex, nextScoreReminder, reminderOptions, scoreMonthLabel, scoreRating } from "@/lib/creditScores";

const CHART_HEIGHT = 220;
const PADDING = { top: 16, right: 24, bottom: 30, left: 40 };
// One series, so it takes the first chart color. The accent is kept for card key stats.
const LINE_COLOR = "var(--series-1)";
// The least room between two month labels on the x-axis.
const MIN_LABEL_SPACING = 64;
// Past this many scores, only the hovered and latest points get a dot, so the line doesn't turn into beads.
const MAX_DOTS = 24;
const TONE_CLASSES = { positive: "text-[var(--accent)]", danger: "text-[var(--danger)]" };

function useWidth(ref) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);
    return width;
}

// The y-axis range: the scores with some room around them, rounded out to 50s and kept within 300-850.
function scoreDomain(scores) {
    const values = scores.map((entry) => Number(entry.score));
    const low = Math.max(MIN_SCORE, Math.floor((Math.min(...values) - 20) / 50) * 50);
    const high = Math.min(MAX_SCORE, Math.ceil((Math.max(...values) + 20) / 50) * 50);
    return [low, high];
}

function scoreTicks([low, high]) {
    const step = high - low > 300 ? 100 : 50;
    const ticks = [];
    for (let tick = Math.ceil(low / step) * step; tick <= high; tick += step) ticks.push(tick);
    return ticks;
}

// Which points get a month label: always the latest, then each one far enough left of the last labeled one.
function labeledIndexes(points) {
    const labeled = new Set();
    let lastX = Infinity;
    for (let index = points.length - 1; index >= 0; index--) {
        if (lastX - points[index].x >= MIN_LABEL_SPACING) {
            labeled.add(index);
            lastX = points[index].x;
        }
    }
    return labeled;
}

// "+12 since Sep 2026", in green when the score went up and red when it went down.
function changeOf(scores, index) {
    if (index < 1) return null;
    const previous = scores[index - 1];
    const difference = Number(scores[index].score) - Number(previous.score);
    const since = `since ${scoreMonthLabel(previous)}`;
    if (difference === 0) return { text: `No change ${since}`, short: "±0" };
    const signed = `${difference > 0 ? "+" : "−"}${Math.abs(difference)}`;
    return { text: `${signed} ${since}`, short: signed, tone: difference > 0 ? "positive" : "danger" };
}

// A line of `scores` (oldest first) over time, with a crosshair and tooltip that snap to the nearest month.
function ScoreChart({ scores }) {
    const containerRef = useRef(null);
    const width = useWidth(containerRef);
    const [active, setActive] = useState(null);
    const gradientId = `score-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const domain = scoreDomain(scores);
    const ticks = scoreTicks(domain);
    const plotLeft = PADDING.left;
    const plotRight = Math.max(plotLeft, width - PADDING.right);
    const plotTop = PADDING.top;
    const plotBottom = CHART_HEIGHT - PADDING.bottom;
    const firstMonth = monthIndex(scores[0]);
    const monthSpan = monthIndex(scores[scores.length - 1]) - firstMonth;

    const xOf = (entry) => (monthSpan === 0
        ? (plotLeft + plotRight) / 2
        : plotLeft + ((monthIndex(entry) - firstMonth) / monthSpan) * (plotRight - plotLeft));
    const yOf = (score) => plotBottom - ((score - domain[0]) / (domain[1] - domain[0])) * (plotBottom - plotTop);

    const points = scores.map((entry) => ({ entry, x: xOf(entry), y: yOf(Number(entry.score)) }));
    const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
    const area = points.length > 1
        ? `${line} L${points[points.length - 1].x},${plotBottom} L${points[0].x},${plotBottom} Z`
        : "";
    const labeled = labeledIndexes(points);
    const lastIndex = points.length - 1;
    const showAllDots = points.length <= MAX_DOTS;

    function handlePointerMove(event) {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
        let nearest = 0;
        points.forEach((point, index) => {
            if (Math.abs(point.x - x) < Math.abs(points[nearest].x - x)) nearest = index;
        });
        setActive(nearest);
    }

    function handleKeyDown(event) {
        if (event.key === "ArrowLeft") setActive((index) => Math.max(0, (index ?? lastIndex) - 1));
        else if (event.key === "ArrowRight") setActive((index) => Math.min(lastIndex, (index ?? lastIndex) + 1));
        else return;
        event.preventDefault();
    }

    // A removed score can leave `active` past the end until the pointer moves again.
    const activePoint = active !== null ? points[active] ?? null : null;
    const activeChange = activePoint ? changeOf(scores, active) : null;
    const latest = scores[lastIndex];

    return (
        <div ref={containerRef} className="relative" style={{ height: CHART_HEIGHT }}>
            {width > 0 && (
                <svg
                    width={width}
                    height={CHART_HEIGHT}
                    className="block touch-none outline-none"
                    tabIndex={0}
                    role="img"
                    aria-label={`FICO score over time, from ${scoreMonthLabel(scores[0])} to ${scoreMonthLabel(latest)}. Latest: ${latest.score}.`}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(lastIndex)}
                    onBlur={() => setActive(null)}
                    onKeyDown={handleKeyDown}
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity="0.14" />
                            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {ticks.map((tick) => {
                        const y = Math.round(yOf(tick)) + 0.5;
                        return (
                            <g key={tick}>
                                <line x1={plotLeft} x2={plotRight} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
                                <text x={plotLeft - 10} y={y} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--muted)" className="tabular-nums">
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    {points.map((point, index) => labeled.has(index) && (
                        <text
                            key={point.entry.id}
                            x={point.x}
                            y={plotBottom + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill={index === active ? "var(--foreground)" : "var(--muted)"}
                        >
                            {scoreMonthLabel(point.entry, { short: true })}
                        </text>
                    ))}

                    {activePoint && (
                        <line
                            x1={activePoint.x}
                            x2={activePoint.x}
                            y1={plotTop}
                            y2={plotBottom}
                            stroke="var(--border-strong)"
                            strokeWidth="1"
                        />
                    )}

                    {area && <path d={area} fill={`url(#${gradientId})`} />}
                    {points.length > 1 && (
                        <path d={line} fill="none" stroke={LINE_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                    )}

                    {points.map((point, index) => {
                        const isActive = index === active;
                        if (!showAllDots && !isActive && index !== lastIndex) return null;
                        return (
                            <circle
                                key={point.entry.id}
                                cx={point.x}
                                cy={point.y}
                                r={isActive ? 6 : 4}
                                fill={LINE_COLOR}
                                stroke="var(--surface)"
                                strokeWidth="2"
                                className="transition-[r] duration-100"
                            />
                        );
                    })}
                </svg>
            )}

            {activePoint && (
                <div
                    className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-[var(--shadow-lg)]"
                    style={{
                        left: Math.min(Math.max(activePoint.x, 64), width - 64),
                        top: activePoint.y,
                        transform: "translate(-50%, calc(-100% - 14px))",
                    }}
                >
                    <div className="text-muted">{scoreMonthLabel(activePoint.entry)}</div>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="text-base font-semibold tabular-nums text-foreground">{activePoint.entry.score}</span>
                        <span className="text-muted">{scoreRating(activePoint.entry.score)}</span>
                    </div>
                    {activeChange && (
                        <div className={`mt-0.5 tabular-nums ${TONE_CLASSES[activeChange.tone] ?? "text-muted"}`}>
                            {activeChange.short} from {scoreMonthLabel(scores[active - 1])}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Month, year and score, with Add (or Update, when that month already has a score).
function AddScoreForm({ scores, onSave }) {
    const now = new Date();
    const [month, setMonth] = useState(months[now.getMonth()].value);
    const [year, setYear] = useState(String(now.getFullYear()));
    const [score, setScore] = useState("");
    const replacing = scores.some((entry) => entry.month === month && entry.year === year);
    const canSave = isValidScore(score);
    const outOfRange = score.length === 3 && !canSave;

    async function handleSubmit(event) {
        event.preventDefault();
        if (!canSave) return;
        const saved = await onSave({ month, year, score: String(Number(score)) });
        if (saved) setScore("");
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[10rem_7rem_minmax(0,1fr)_auto]">
                <select className={`${inputClasses} min-w-0`} aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
                    {months.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <select className={`${inputClasses} min-w-0`} aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
                    {pastYears.map((option) => (
                        <option key={option} value={String(option)}>{option}</option>
                    ))}
                </select>
                <input
                    type="text"
                    inputMode="numeric"
                    className={`${inputClasses} min-w-0 tabular-nums`}
                    placeholder={`Score (${MIN_SCORE}–${MAX_SCORE})`}
                    aria-label="FICO score"
                    aria-invalid={outOfRange}
                    value={score}
                    onChange={(e) => setScore(onlyDigits(e.target.value).slice(0, 3))}
                />
                <button type="submit" disabled={!canSave} className="btn btn-primary shrink-0">
                    <PlusIcon size={14} />
                    {replacing ? "Update" : "Add"}
                </button>
            </div>
            {outOfRange && <span className="field-error">FICO scores go from {MIN_SCORE} to {MAX_SCORE}</span>}
            {!outOfRange && replacing && (
                <span className="field-hint">
                    {scoreMonthLabel({ month, year })} already has a score; this replaces it
                </span>
            )}
        </form>
    );
}

// A history row being edited: month, year and score inputs, with the check to save and the X to cancel. Enter saves
// and Escape cancels, the same as editing an additional expense on Budgeting.
function EditScoreRow({ entry, scores, onSave, onCancel }) {
    const [month, setMonth] = useState(entry.month);
    const [year, setYear] = useState(entry.year);
    const [score, setScore] = useState(entry.score);
    const canSave = isValidScore(score);
    const outOfRange = score.length === 3 && !canSave;
    // Moving the score to a month that already has one replaces that one.
    const replaced = scores.find((other) => other.id !== entry.id && other.month === month && other.year === year);
    // Older years than the form offers stay pickable for a score saved with one.
    const yearOptions = pastYears.map(String).includes(entry.year) ? pastYears.map(String) : [...pastYears.map(String), entry.year];

    function handleSubmit(event) {
        event.preventDefault();
        if (!canSave) return;
        onSave({ ...entry, month, year, score: String(Number(score)) });
    }

    return (
        <li className="border-b border-[var(--border)] py-1.5 text-sm last:border-b-0">
            <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => e.key === "Escape" && onCancel()}
                className="flex flex-wrap items-center gap-2"
            >
                <select className={`${inputClasses} w-auto min-w-0 flex-1 sm:w-36 sm:flex-none`} aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
                    {months.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <select className={`${inputClasses} w-auto min-w-0 flex-1 sm:w-24 sm:flex-none`} aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
                    {yearOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    className={`${inputClasses} w-20 tabular-nums`}
                    aria-label="FICO score"
                    aria-invalid={outOfRange}
                    value={score}
                    onChange={(e) => setScore(onlyDigits(e.target.value).slice(0, 3))}
                />
                <div className="ml-auto flex items-center gap-1">
                    <button type="submit" disabled={!canSave} className="icon-btn" aria-label={`Save the ${scoreMonthLabel(entry)} score`}>
                        <CheckIcon size={14} />
                    </button>
                    <button type="button" onClick={onCancel} className="icon-btn" aria-label="Cancel editing">
                        <XIcon size={14} />
                    </button>
                </div>
            </form>
            {outOfRange && <div className="field-error mt-1">FICO scores go from {MIN_SCORE} to {MAX_SCORE}</div>}
            {!outOfRange && replaced && (
                <div className="field-hint mt-1">This replaces the {scoreMonthLabel(replaced)} score ({replaced.score})</div>
            )}
        </li>
    );
}

// Every score, newest first, with its change from the month before. Also the chart's table view. The pencil edits a
// row in place; the X removes it.
function ScoreHistory({ scores, onEdit, onRemove }) {
    const [editingId, setEditingId] = useState(null);

    function handleRemove(id) {
        if (id === editingId) setEditingId(null);
        onRemove(id);
    }

    return (
        <ul className="mt-2">
            {scores.map((entry, index) => ({ entry, index })).reverse().map(({ entry, index }) => {
                if (entry.id === editingId) {
                    return (
                        <EditScoreRow
                            key={entry.id}
                            entry={entry}
                            scores={scores}
                            onSave={(edited) => {
                                onEdit(edited);
                                setEditingId(null);
                            }}
                            onCancel={() => setEditingId(null)}
                        />
                    );
                }
                const change = changeOf(scores, index);
                return (
                    <li key={entry.id} className="flex items-center gap-3 border-b border-[var(--border)] py-1.5 text-sm last:border-b-0">
                        <span className="w-20 shrink-0 text-muted">{scoreMonthLabel(entry)}</span>
                        <span className="w-10 shrink-0 font-medium tabular-nums">{entry.score}</span>
                        <span className={`w-12 shrink-0 text-xs tabular-nums ${change ? TONE_CLASSES[change.tone] ?? "text-muted" : ""}`}>
                            {change?.short}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs text-muted">{scoreRating(entry.score)}</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setEditingId(entry.id)}
                                className="icon-btn"
                                aria-label={`Edit the ${scoreMonthLabel(entry)} score`}
                            >
                                <PencilIcon size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRemove(entry.id)}
                                className="icon-btn"
                                aria-label={`Remove the ${scoreMonthLabel(entry)} score`}
                            >
                                <XIcon size={14} />
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

const SPARKLINE_WIDTH = 96;
const SPARKLINE_HEIGHT = 32;

// A tiny trend line of the last year of scores, shown in the collapsed header.
function Sparkline({ scores }) {
    const recent = scores.slice(-12);
    if (recent.length < 2) return null;
    const values = recent.map((entry) => Number(entry.score));
    const low = Math.min(...values);
    const range = Math.max(...values) - low || 1;
    const inset = 3;
    const points = values.map((value, index) => [
        inset + (index / (values.length - 1)) * (SPARKLINE_WIDTH - inset * 2),
        inset + (1 - (value - low) / range) * (SPARKLINE_HEIGHT - inset * 2),
    ]);
    const [lastX, lastY] = points[points.length - 1];

    return (
        <svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT} className="hidden shrink-0 sm:block" aria-hidden="true">
            <polyline
                points={points.map((point) => point.join(",")).join(" ")}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <circle cx={lastX} cy={lastY} r="3" fill={LINE_COLOR} stroke="var(--surface)" strokeWidth="1.5" />
        </svg>
    );
}

// When to be reminded on Home to enter the month's score, with the next reminder's date.
function ReminderPicker({ reminder, scores, onChange }) {
    const next = nextScoreReminder(reminder, scores);

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <label className="flex items-center gap-2">
                <span className="text-muted">Reminder</span>
                <select
                    className={`${inputClasses} w-auto py-1.5`}
                    value={reminder}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {reminderOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>
            {next && (
                <span className="text-xs text-muted">
                    Next: {next.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </span>
            )}
        </div>
    );
}

// The FICO score card on the Credit Cards page. Collapsed (the default), it's one row like a credit card's InfoCard:
// the latest score, its rating and month, the change since the month before, and a sparkline. Expanded, it adds the
// chart of every month entered, a form to add one, the reminder setting and the full history. `scores` is oldest
// first; saving goes through the page.
function CreditScoreCard({ scores, reminder, onSave, onEdit, onRemove, onReminderChange }) {
    const [expanded, setExpanded] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const latest = scores[scores.length - 1];
    const change = changeOf(scores, scores.length - 1);
    const subtitle = latest
        ? `${scoreRating(latest.score)} · ${scoreMonthLabel(latest)}`
        : "Track your score month by month";

    return (
        <section className="card">
            <div className="flex cursor-pointer items-center gap-3 p-4" onClick={() => setExpanded((open) => !open)}>
                <div className="logo-tile bg-[var(--surface-hover)] text-muted">
                    <GaugeIcon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate font-medium">FICO Score</h2>
                    <div className="truncate text-sm text-muted">{subtitle}</div>
                </div>
                {latest && (
                    <span className={`transition-opacity duration-200 ${expanded ? "opacity-0" : "opacity-100"}`}>
                        <Sparkline scores={scores} />
                    </span>
                )}
                {latest && (
                    <div className="key-stat">
                        <div className="key-stat-value text-xl">{latest.score}</div>
                        {change && (
                            <div className={`text-xs tabular-nums ${TONE_CLASSES[change.tone] ?? "text-muted"}`}>
                                {/* Just the change on phones, so the title keeps its room */}
                                <span className="sm:hidden">{change.short}</span>
                                <span className="hidden sm:inline">{change.text}</span>
                            </div>
                        )}
                    </div>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((open) => !open);
                    }}
                    className="icon-btn shrink-0"
                    aria-label={expanded ? "Hide score chart" : "Show score chart"}
                    aria-expanded={expanded}
                >
                    <span className={`block transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                        <ChevronDownIcon />
                    </span>
                </button>
            </div>

            <div className="expand" data-open={expanded}>
                <div inert={!expanded}>
                    <div className="mx-4 mb-4 border-t border-[var(--border)] pt-4 sm:mx-5 sm:mb-5">
                        {scores.length > 0 ? (
                            <ScoreChart scores={scores} />
                        ) : (
                            <p className="rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-10 text-center text-sm text-muted">
                                Add your FICO score each month to see how it changes over time.
                            </p>
                        )}

                        <div className="mt-5 border-t border-[var(--border)] pt-4">
                            <AddScoreForm scores={scores} onSave={onSave} />
                        </div>

                        <div className="mt-3">
                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                {scores.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowHistory((shown) => !shown)}
                                        aria-expanded={showHistory}
                                        className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
                                    >
                                        History ({scores.length})
                                        <span className={`transition-transform duration-200 ${showHistory ? "rotate-180" : ""}`}>
                                            <ChevronDownIcon size={14} />
                                        </span>
                                    </button>
                                ) : <span />}
                                <ReminderPicker reminder={reminder} scores={scores} onChange={onReminderChange} />
                            </div>
                            {showHistory && scores.length > 0 && (
                                <ScoreHistory scores={scores} onEdit={onEdit} onRemove={onRemove} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CreditScoreCard;
