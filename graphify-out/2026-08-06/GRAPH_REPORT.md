# Graph Report - /Users/christianstengel/dev/ScalableCLI-Dashboard  (2026-08-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 645 nodes · 1186 edges · 38 communities (28 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d86230ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- chart-context.tsx
- chart-tooltip.tsx
- projection-utils.ts
- line.tsx
- dependencies
- page.tsx
- cn
- loading-sweep.tsx
- compilerOptions
- line-chart.tsx
- devDependencies
- components.json
- x-axis.tsx
- time-series-chart-shell.tsx
- animation.ts
- y-domain-utils.ts
- Scalable Capital Web Dashboard
- use-animated-y-domains.ts
- use-chart-interaction.ts
- reference-area-config.ts
- chart-defs.ts
- layout.tsx
- y-axis-ticks.ts
- reset/route.ts
- alerts/route.ts
- watchlist/route.ts
- chart/route.ts
- holdings/route.ts
- logout/route.ts
- overview/route.ts
- tagesgeld/route.ts
- transactions/route.ts
- whoami/route.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `useChartStable()` - 27 edges
2. `cn()` - 25 edges
3. `compilerOptions` - 16 edges
4. `useYScale()` - 14 edges
5. `ChartPhase` - 13 edges
6. `useChartConfig()` - 12 edges
7. `Line()` - 12 edges
8. `normalizeYAxisId()` - 11 edges
9. `SpringConfig` - 10 edges
10. `Margin` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ChartContainer()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `ChartTooltipContent()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `useChart()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `SeriesMarkers()` --calls--> `clipRevealTransition()`  [EXTRACTED]
  src/components/charts/series-markers.tsx → src/components/charts/animation.ts
- `AreaGradientDefsProps` --references--> `FadeEdges`  [EXTRACTED]
  src/components/charts/area-gradient-defs.tsx → src/components/charts/fade-edges.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Application Data Flow** — dashboard_app, api_routes_layer, scalable_cli_tool, backend_service [EXTRACTED 1.00]

## Communities (38 total, 10 thin omitted)

### Community 0 - "chart-context.tsx"
Cohesion: 0.06
Nodes (55): ChartHoverContext, ChartHoverContextValue, ChartProvider(), ChartStableContext, ChartStableContextValue, defaultScatterColors, ScaleBand, ScaleLinear (+47 more)

### Community 1 - "chart-tooltip.tsx"
Cohesion: 0.08
Nodes (43): ChartConfigContext, ChartConfigProviderProps, ChartConfigValue, DEFAULT_CHART_CONFIG, resolveTooltipBoxMotion(), SpringConfig, useChartConfig(), chartCssVars (+35 more)

### Community 2 - "projection-utils.ts"
Cohesion: 0.07
Nodes (43): CHART_CLIP_PASSTHROUGH, CLIP_EXCLUDED_COMPONENT_NAMES, isChartClipPassthrough(), isClipExcludedComponent(), isPostOverlayComponent(), isUnderlayComponent(), resolveChartChildElement(), UNDERLAY_COMPONENT_NAMES (+35 more)

### Community 3 - "line.tsx"
Cohesion: 0.09
Nodes (32): AreaGradientDefs(), AreaGradientDefsProps, LoadingStyle, DashTailStroke(), DashTailStrokeProps, FadeEdges, FadeGradientStop, fadeGradientStops() (+24 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (43): @base-ui/react, class-variance-authority, clsx, d3-array, d3-shape, framer-motion, lucide-react, motion (+35 more)

### Community 5 - "page.tsx"
Cohesion: 0.06
Nodes (28): AssetAllocationChart(), AssetAllocationChartProps, COLORS, HoldingItem, DividendsInterestSection(), DividendsInterestSectionProps, TransactionItem, Header() (+20 more)

### Community 6 - "cn"
Cohesion: 0.10
Nodes (28): react, react, ChartLoadingLabel(), ChartLoadingLabelProps, LOADING_LABEL_EXIT_Y_PX, ShimmeringText(), ShimmeringTextProps, Button() (+20 more)

### Community 7 - "loading-sweep.tsx"
Cohesion: 0.11
Nodes (25): LINE_LOADING_LOOP_PAUSE_MS, LINE_LOADING_PULSE_CYCLE_S, LINE_LOADING_PULSE_EASE, LOADING_LABEL_EXIT_S, BarLoadingSkeleton(), BarLoadingSkeletonProps, CurveFactory, generateEasedGradientStops() (+17 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "line-chart.tsx"
Cohesion: 0.14
Nodes (24): ChartContextValue, Margin, ChartPhase, ChartStatus, DEFAULT_CHART_LIFECYCLE, DEFAULT_CHART_STATUS, DEFAULT_Y_DOMAIN_TWEEN_MS, isChartInteractionPhase() (+16 more)

### Community 10 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 12 - "x-axis.tsx"
Cohesion: 0.16
Nodes (17): allIndexLayouts(), AxisTick, binomial(), buildDataAlignedTicks(), composePositiveSum(), dedupeIndicesByLabel(), gapsToIndices(), indexGaps() (+9 more)

### Community 13 - "time-series-chart-shell.tsx"
Cohesion: 0.14
Nodes (12): decimateTimeSeries(), maxRenderPointsForWidth(), filterDataByXDomain(), resolveBrushTrackXExtent(), resolveDataXExtent(), computeSeriesBarRevealClipPadding(), computeSeriesBarWidth(), StaticChartPreviewContext (+4 more)

### Community 14 - "animation.ts"
Cohesion: 0.17
Nodes (8): clipRevealTransition(), DEFAULT_ANIMATION_DURATION_MS, DEFAULT_ANIMATION_EASING, DEFAULT_CHART_ENTER_TRANSITION, ChartRevealClip(), ChartRevealClipMode, ChartRevealClipProps, SpringOptions

### Community 15 - "y-domain-utils.ts"
Cohesion: 0.22
Nodes (11): buildYScalesForLines(), buildYScalesFromDomains(), DEFAULT_Y_AXIS_ID, getPrimaryYScale(), groupLinesByYAxisId(), normalizeYAxisId(), YAxisOrientation, YScale (+3 more)

### Community 16 - "Scalable Capital Web Dashboard"
Cohesion: 0.18
Nodes (12): Next.js API Routes, Scalable Capital Backend, Scalable Capital Web Dashboard, Framer Motion, Lucide React, Next.js, React, README (+4 more)

### Community 17 - "use-animated-y-domains.ts"
Cohesion: 0.36
Nodes (10): lerpDomain(), snapDomains(), tweenDomains(), useAnimatedYDomains(), UseAnimatedYDomainsOptions, domainsEqual(), isYDomainTweenPhase(), resolveAnimatedYDestinationDomains() (+2 more)

### Community 18 - "use-chart-interaction.ts"
Cohesion: 0.29
Nodes (8): TooltipData, ChartInteractionResult, ScaleLinear, ScaleTime, useChartInteraction(), defaultDedupeKey(), ScheduledTooltipControls, useScheduledTooltip()

### Community 19 - "reference-area-config.ts"
Cohesion: 0.29
Nodes (7): extractReferenceAreaConfigs(), getChildComponentName(), isReferenceAreaElement(), ReferenceAreaConfig, ReferenceAreaConfigProps, ReferenceAreaRegistrationContext, ReferenceAreaRegistrationContextValue

### Community 20 - "chart-defs.ts"
Cohesion: 0.50
Nodes (7): collectChartDefsChildren(), getChartChildComponentName(), isChartDefsComponent(), isGradientDefComponent(), isPatternDefComponent(), partitionChartDefNodes(), VISX_PATTERN_COMPONENT_NAMES

### Community 21 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 22 - "y-axis-ticks.ts"
Cohesion: 0.40
Nodes (3): Y_AXIS_DEFAULT_TICK_COUNT, Y_AXIS_MAX_TICK_COUNT, Y_AXIS_MIN_TICK_COUNT

### Community 23 - "reset/route.ts"
Cohesion: 0.67
Nodes (3): execAsync, POST(), SC_OPTIONS

### Community 24 - "alerts/route.ts"
Cohesion: 0.83
Nodes (3): execAsync, GET(), POST()

### Community 25 - "watchlist/route.ts"
Cohesion: 0.83
Nodes (3): execAsync, GET(), POST()

## Knowledge Gaps
- **198 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+193 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `line-chart.tsx`, `x-axis.tsx`, `chart-tooltip.tsx`, `loading-sweep.tsx`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `cn`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `react` connect `cn` to `dependencies`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `chart-context.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05583972719522592 - nodes in this community are weakly interconnected._
- **Should `chart-tooltip.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08282828282828283 - nodes in this community are weakly interconnected._
- **Should `projection-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07227891156462585 - nodes in this community are weakly interconnected._